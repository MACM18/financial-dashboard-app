"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, CreditCard, TrendingDown, Calendar, DollarSign, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface DebtPayment {
  id: string
  month: string
  startingBalance: number
  paymentAmount: number
  remainingBalance: number
  isPaid: boolean
  dueDate: string
}

interface Debt {
  id: string
  name: string
  originalAmount: number
  currentBalance: number
  interestRate: number
  minimumPayment: number
  paymentSchedule: DebtPayment[]
  type: string
  color: string
}

// Mock data - will be replaced with Appwrite data later
const initialDebts: Debt[] = [
  {
    id: "1",
    name: "Credit Card - Chase",
    originalAmount: 15000,
    currentBalance: 12450,
    interestRate: 18.99,
    minimumPayment: 350,
    type: "Credit Card",
    color: "bg-red-500",
    paymentSchedule: [
      {
        id: "p1",
        month: "January 2024",
        startingBalance: 13150,
        paymentAmount: 350,
        remainingBalance: 12800,
        isPaid: true,
        dueDate: "2024-01-15",
      },
      {
        id: "p2",
        month: "February 2024",
        startingBalance: 12800,
        paymentAmount: 350,
        remainingBalance: 12450,
        isPaid: true,
        dueDate: "2024-02-15",
      },
      {
        id: "p3",
        month: "March 2024",
        startingBalance: 12450,
        paymentAmount: 350,
        remainingBalance: 12100,
        isPaid: false,
        dueDate: "2024-03-15",
      },
      {
        id: "p4",
        month: "April 2024",
        startingBalance: 12100,
        paymentAmount: 350,
        remainingBalance: 11750,
        isPaid: false,
        dueDate: "2024-04-15",
      },
      {
        id: "p5",
        month: "May 2024",
        startingBalance: 11750,
        paymentAmount: 350,
        remainingBalance: 11400,
        isPaid: false,
        dueDate: "2024-05-15",
      },
    ],
  },
  {
    id: "2",
    name: "Student Loan",
    originalAmount: 25000,
    currentBalance: 18500,
    interestRate: 4.5,
    minimumPayment: 280,
    type: "Student Loan",
    color: "bg-blue-500",
    paymentSchedule: [
      {
        id: "p6",
        month: "January 2024",
        startingBalance: 18780,
        paymentAmount: 280,
        remainingBalance: 18500,
        isPaid: true,
        dueDate: "2024-01-01",
      },
      {
        id: "p7",
        month: "February 2024",
        startingBalance: 18500,
        paymentAmount: 280,
        remainingBalance: 18220,
        isPaid: true,
        dueDate: "2024-02-01",
      },
      {
        id: "p8",
        month: "March 2024",
        startingBalance: 18220,
        paymentAmount: 280,
        remainingBalance: 17940,
        isPaid: false,
        dueDate: "2024-03-01",
      },
    ],
  },
]

export function DebtTracker() {
  const [debts, setDebts] = useState<Debt[]>(initialDebts)
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const togglePaymentStatus = (debtId: string, paymentId: string) => {
    setDebts((prev) =>
      prev.map((debt) =>
        debt.id === debtId
          ? {
              ...debt,
              paymentSchedule: debt.paymentSchedule.map((payment) =>
                payment.id === paymentId ? { ...payment, isPaid: !payment.isPaid } : payment,
              ),
            }
          : debt,
      ),
    )
  }

  const getDebtProgress = (debt: Debt) => {
    const totalPaid = debt.originalAmount - debt.currentBalance
    return (totalPaid / debt.originalAmount) * 100
  }

  const getPaymentProgress = (debt: Debt) => {
    const paidPayments = debt.paymentSchedule.filter((p) => p.isPaid).length
    return (paidPayments / debt.paymentSchedule.length) * 100
  }

  const totalDebt = debts.reduce((sum, debt) => sum + debt.currentBalance, 0)
  const totalOriginalDebt = debts.reduce((sum, debt) => sum + debt.originalAmount, 0)
  const totalMinimumPayments = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0)
  const totalPaid = totalOriginalDebt - totalDebt

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Debt</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalDebt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalPaid)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Monthly Payments</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(totalMinimumPayments)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {Math.round((totalPaid / totalOriginalDebt) * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Debt Overview */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Debt Overview</h2>
          <p className="text-muted-foreground">Track your debt repayment progress</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Debt
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Debt</DialogTitle>
              <DialogDescription>Add a new debt to track your repayment progress.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="debtName">Debt Name</Label>
                <Input id="debtName" placeholder="e.g., Credit Card - Chase" />
              </div>
              <div>
                <Label htmlFor="currentBalance">Current Balance</Label>
                <Input id="currentBalance" type="number" placeholder="12450" />
              </div>
              <div>
                <Label htmlFor="interestRate">Interest Rate (%)</Label>
                <Input id="interestRate" type="number" step="0.01" placeholder="18.99" />
              </div>
              <div>
                <Label htmlFor="minimumPayment">Minimum Payment</Label>
                <Input id="minimumPayment" type="number" placeholder="350" />
              </div>
              <Button className="w-full">Add Debt</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Debt Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {debts.map((debt) => {
          const debtProgress = getDebtProgress(debt)
          const paymentProgress = getPaymentProgress(debt)

          return (
            <Card key={debt.id} className="relative overflow-hidden">
              {/* Color accent bar */}
              <div className={cn("absolute top-0 left-0 right-0 h-1", debt.color)} />

              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{debt.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {debt.type}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">APR</p>
                    <p className="font-semibold">{debt.interestRate}%</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Debt Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Debt Reduction</span>
                    <span className="font-medium">{Math.round(debtProgress)}%</span>
                  </div>
                  <Progress value={debtProgress} className="h-2" />
                </div>

                {/* Amounts */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Current Balance</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      {formatCurrency(debt.currentBalance)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Original Amount</span>
                    <span className="font-semibold">{formatCurrency(debt.originalAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Minimum Payment</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {formatCurrency(debt.minimumPayment)}
                    </span>
                  </div>
                </div>

                {/* Payment Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Payment Progress</span>
                    <span className="font-medium">{Math.round(paymentProgress)}%</span>
                  </div>
                  <Progress value={paymentProgress} className="h-2" />
                </div>

                {/* View Details Button */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full bg-transparent" onClick={() => setSelectedDebt(debt)}>
                      <Calendar className="h-4 w-4 mr-2" />
                      View Payment Schedule
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Payment Schedule: {debt.name}</DialogTitle>
                      <DialogDescription>Track your monthly payments and mark them as completed.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">Paid</TableHead>
                            <TableHead>Month</TableHead>
                            <TableHead>Starting Balance</TableHead>
                            <TableHead>Payment Made</TableHead>
                            <TableHead>Remaining Balance</TableHead>
                            <TableHead>Due Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {debt.paymentSchedule.map((payment) => (
                            <TableRow key={payment.id} className={payment.isPaid ? "bg-muted/50" : ""}>
                              <TableCell>
                                <Checkbox
                                  checked={payment.isPaid}
                                  onCheckedChange={() => togglePaymentStatus(debt.id, payment.id)}
                                />
                              </TableCell>
                              <TableCell className="font-medium">{payment.month}</TableCell>
                              <TableCell>{formatCurrency(payment.startingBalance)}</TableCell>
                              <TableCell className="text-red-600 dark:text-red-400">
                                -{formatCurrency(payment.paymentAmount)}
                              </TableCell>
                              <TableCell className="font-semibold">
                                {formatCurrency(payment.remainingBalance)}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(payment.dueDate).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Debt Reduction Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Progress</span>
              <span className="font-semibold">{Math.round((totalPaid / totalOriginalDebt) * 100)}%</span>
            </div>
            <Progress value={(totalPaid / totalOriginalDebt) * 100} className="h-3" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Remaining debt:</span>
                <p className="font-semibold text-lg text-red-600 dark:text-red-400">{formatCurrency(totalDebt)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Total paid off:</span>
                <p className="font-semibold text-lg text-green-600 dark:text-green-400">{formatCurrency(totalPaid)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
