import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Filter, Download, Calendar as CalendarIcon, FileTextIcon, DownloadIcon } from "lucide-react";
import { StatusIndicator } from "@/components/StatusIndicator";
import axios from "axios";

export default function History() {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [historyData, setHistoryData] = useState([]);
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);


  useEffect(() => {
    // Fetch history data from API if needed
    const fetchHistoryData = async () => {
      try {
        const response = await axios.get(`${API}/api/payments/all`, {withCredentials: true});
        console.log(`Fetched rental history:`, response.data.payments);
        const paymentHistory = await Promise.all(
          response.data.payments.map(async (payment) => {
            const renterFetch = await axios.get(`${API}/api/users/${payment.userId}`, {withCredentials: true});
            const renter = renterFetch.data.user;

            const carFetch = await axios.get(`${API}/api/cars/${payment.carId}`, {withCredentials: true});
            const car = carFetch.data.car;

            return {
              id: payment.transactionId,
              bookingId: payment.bookingId,
              transactionType: payment.transactionType,
              customer: `${renter.firstName} ${renter.lastName}`,
              vehicle: `${car.name} - ${car.year}`,
              amount: `PHP ${payment.totalAmount}`,
              paymentStatus: payment.status,
              proofOfPayment: payment.paymentProof
            }
          })
        );
        setHistoryData(paymentHistory);
      } catch (error) {
        console.log(error.response.data.message);
        console.error("Error fetching rental history:", error);
      }
    };

    fetchHistoryData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, paymentFilter]);


  const filteredData = historyData.filter((rental) => {
    const matchesSearch =
      rental.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rental.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rental.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPayment = paymentFilter === "all" || rental.paymentStatus === paymentFilter;

    return matchesSearch && matchesPayment;
  });

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            History Management
          </h1>
          <p className="text-gray-600 mt-1">
            Check Transaction History
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export History
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Rentals</p>
          <p className="text-2xl font-bold">{historyData.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Completed</p>
          <p className="text-2xl font-bold text-stat-blue">
            {historyData.filter((r) => r.paymentStatus.toLowerCase() === "completed").length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Pending</p>
          <p className="text-2xl font-bold text-stat-orange">
            {historyData.filter((r) => r.paymentStatus.toLowerCase() === "pending").length}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer, vehicle, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* History Table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Booking ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Proof of Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((rental) => (
                  <TableRow key={rental.id}>
                    <TableCell className="font-medium">{rental.id}</TableCell>
                    <TableCell className="font-medium">{rental.bookingId}</TableCell>
                    <TableCell className="font-medium">{rental.transactionType}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-xs font-semibold">
                            {rental.customer.split(" ").map((n) => n[0]).join("")}
                          </span>
                        </div>
                        <span>{rental.customer}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-48">{rental.vehicle}</TableCell>
                    <TableCell className="font-semibold">{rental.amount}</TableCell>
                    <TableCell>
                      <StatusIndicator status={rental.paymentStatus} />
                    </TableCell>
                    <TableCell className="font-semibold">
                      <a
                        href={`${rental.proofOfPayment.replace(
                          `/upload/${rental.user}`,
                          `/upload/${rental.user}/fl_attachment:payment_proofs/`
                        )}`}
                        download
                        className="flex items-center text-green-600 hover:text-green-700 font-medium text-sm"
                      >
                        <FileTextIcon size={16} className="mr-1" />
                          Download Proof
                        <DownloadIcon size={14} className="ml-1" />
                      </a></TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No rental history found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} of{" "}
            {filteredData.length} rentals
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            >
              Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() =>
                setCurrentPage((p) => Math.min(p + 1, totalPages))
              }
            >
              Next
            </Button>
          </div>
        </div>

      </Card>
    </div>
  );
}
