import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Hairdresser {
  id: string;
  name: string;
  email: string;
}

interface Invoice {
  invoice_number: string;
  generated_date: string;
  period: {
    month: number;
    year: number;
    month_name: string;
  };
  hairdresser: {
    id: string;
    name: string;
    email: string;
    salon: string;
  };
  summary: {
    total_bookings: number;
    total_revenue: string;
    commission_rate: number;
    total_commission: string;
  };
  line_items: Array<{
    booking_id: string;
    date: string;
    service_cost: string;
    commission_rate: number;
    commission_amount: string;
  }>;
}

export const FinancialTab = () => {
  const [hairdressers, setHairdressers] = useState<Hairdresser[]>([]);
  const [selectedHairdresser, setSelectedHairdresser] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth() + 1 + "");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear() + "");
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchHairdressers();
  }, []);

  const fetchHairdressers = async () => {
    try {
      const { data, error } = await supabase
        .from("hairdressers")
        .select(`
          id,
          profiles!hairdressers_profile_id_fkey (
            full_name,
            email
          )
        `);

      if (error) throw error;

      const formatted = (data || []).map((h: any) => ({
        id: h.id,
        name: h.profiles?.full_name || "Unknown",
        email: h.profiles?.email || "",
      }));

      setHairdressers(formatted);
    } catch (error: any) {
      console.error("Error fetching hairdressers:", error);
      toast({
        title: "Error",
        description: "Failed to load hairdressers",
        variant: "destructive",
      });
    }
  };

  const generateInvoice = async () => {
    if (!selectedHairdresser || !selectedMonth || !selectedYear) {
      toast({
        title: "Error",
        description: "Please select hairdresser, month, and year",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      setInvoice(null);

      const { data, error } = await supabase.functions.invoke("generate-commission-invoice", {
        body: {
          hairdresser_id: selectedHairdresser,
          month: parseInt(selectedMonth),
          year: parseInt(selectedYear),
        },
      });

      if (error) throw error;

      if (data.invoice) {
        setInvoice(data.invoice);
        toast({
          title: "Success",
          description: "Invoice generated successfully",
        });
      } else {
        toast({
          title: "No Data",
          description: "No commission data found for the selected period",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error generating invoice:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate invoice",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = () => {
    if (!invoice) return;

    const invoiceText = `
COMMISSION INVOICE
${invoice.invoice_number}
Generated: ${new Date(invoice.generated_date).toLocaleString()}

Period: ${invoice.period.month_name} ${invoice.period.year}

HAIRDRESSER DETAILS
Name: ${invoice.hairdresser.name}
Email: ${invoice.hairdresser.email}
Salon: ${invoice.hairdresser.salon}

SUMMARY
Total Bookings: ${invoice.summary.total_bookings}
Total Revenue: R${invoice.summary.total_revenue}
Commission Rate: ${invoice.summary.commission_rate}%
Total Commission: R${invoice.summary.total_commission}

LINE ITEMS
${invoice.line_items.map((item, index) => `
${index + 1}. ${item.date}
   Booking ID: ${item.booking_id}
   Service Cost: R${item.service_cost}
   Commission: R${item.commission_amount}
`).join('\n')}
    `;

    const blob = new Blob([invoiceText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${invoice.invoice_number}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Commission Invoice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <Label>Hairdresser</Label>
              <Select value={selectedHairdresser} onValueChange={setSelectedHairdresser}>
                <SelectTrigger>
                  <SelectValue placeholder="Select hairdresser" />
                </SelectTrigger>
                <SelectContent>
                  {hairdressers.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Month</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={generateInvoice} disabled={loading} className="w-full">
                {loading ? "Generating..." : "Generate Invoice"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {invoice && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Invoice: {invoice.invoice_number}</CardTitle>
              <Button onClick={downloadInvoice} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Hairdresser Details</h3>
                <p className="text-sm">
                  <strong>Name:</strong> {invoice.hairdresser.name}
                </p>
                <p className="text-sm">
                  <strong>Email:</strong> {invoice.hairdresser.email}
                </p>
                <p className="text-sm">
                  <strong>Salon:</strong> {invoice.hairdresser.salon}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Invoice Period</h3>
                <p className="text-sm">
                  <strong>Period:</strong> {invoice.period.month_name} {invoice.period.year}
                </p>
                <p className="text-sm">
                  <strong>Generated:</strong>{" "}
                  {new Date(invoice.generated_date).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{invoice.summary.total_bookings}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R{invoice.summary.total_revenue}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Commission Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{invoice.summary.commission_rate}%</div>
                </CardContent>
              </Card>

              <Card className="bg-primary text-primary-foreground">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Total Commission
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R{invoice.summary.total_commission}</div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Line Items</h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Service Cost</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Commission</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.line_items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {item.booking_id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>R{item.service_cost}</TableCell>
                        <TableCell>{item.commission_rate}%</TableCell>
                        <TableCell className="font-semibold">R{item.commission_amount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
