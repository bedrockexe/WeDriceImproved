import { StatCard } from "@/components/StatCard";
import { Car, CheckCircle, Clock, Search, ArrowUpDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const customers = Array(10).fill({
  name: "Kenn Jarangue",
  paymentType: "Reservation",
  vehicle: "Shadow",
  date: "Sept 19, 2025",
  total: "PHP 10,000",
  status: "Pending",
});

export default function Customers() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState(null);
  const navigate = useNavigate();

  const handleVerify = () => {
    setIsDialogOpen(true);
  };

  const handleConfirm = () => {
    setIsDialogOpen(false);
    navigate("/verification");
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Completed Rent"
          value="10"
          subtitle="Successfully returned vehicles"
          icon={Car}
          valueColorClass="text-stat-blue"
          iconColorClass="bg-stat-blue/10 text-stat-blue"
        />
        <StatCard
          title="Active Rent"
          value="1"
          icon={CheckCircle}
          valueColorClass="text-stat-green"
          iconColorClass="bg-stat-green/10 text-stat-green"
        />
        <StatCard
          title="Pending Rent"
          value="2"
          icon={Clock}
          valueColorClass="text-stat-orange"
          iconColorClass="bg-stat-orange/10 text-stat-orange"
        />
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              Export Data
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Select>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            
            <Select>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="all">All Status</SelectItem>
              </SelectContent>
            </Select>
            
            <Select>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by Total" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low to High</SelectItem>
                <SelectItem value="high">High to Low</SelectItem>
                <SelectItem value="all">All Amounts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="flex items-center gap-2 hover:text-foreground transition-colors group"
                >
                  Customer Name
                  <ArrowUpDown className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </TableHead>
              <TableHead>Payment Type</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs font-semibold">KJ</span>
                    </div>
                    <span className="font-medium">{customer.name}</span>
                  </div>
                </TableCell>
                <TableCell>{customer.paymentType}</TableCell>
                <TableCell>{customer.vehicle}</TableCell>
                <TableCell>{customer.date}</TableCell>
                <TableCell className="font-semibold">{customer.total}</TableCell>
                <TableCell>
                  <Badge 
                    variant="secondary" 
                    className="bg-status-pending text-foreground"
                  >
                    {customer.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={handleVerify}>
                    Verify Customer
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-4 text-sm text-muted-foreground">
          Showing 1-10 of 23 trips
        </div>
      </Card>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Verify Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to verify this customer? This will take you to the verification page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Proceed to Verify
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
