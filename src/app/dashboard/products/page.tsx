'use client';

import * as React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { AddProductDialog } from "./add-product-dialog";
import { useRequireAdmin } from '@/hooks/use-require-admin';

type Product = {
  name: string;
  status: "Active" | "In Development" | "Paused";
  sales: number;
  category: string;
};

const initialProducts: Product[] = [
  { name: "PrintPilot", status: "Active", sales: 12500, category: "Productivity" },
  { name: "StickerPilot", status: "Active", sales: 8800, category: "Design" },
  { name: "TimePilot", status: "Active", sales: 21000, category: "Productivity" },
  { name: "InventoryPilot", status: "In Development", sales: 0, category: "Operations" },
  { name: "SupportPilot", status: "Paused", sales: 3400, category: "Customer Service" },
];

const chartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(var(--chart-1))",
  },
  print: {
    label: "PrintPilot",
    color: "hsl(var(--chart-1))",
  },
  sticker: {
    label: "StickerPilot",
    color: "hsl(var(--chart-2))",
  },
  time: {
    label: "TimePilot",
    color: "hsl(var(--chart-3))",
  },
}

export default function ProductsPage() {
  useRequireAdmin();
  const [products, setProducts] = React.useState<Product[]>(initialProducts);

  const chartData = products
    .filter(p => p.status === 'Active')
    .map(p => ({
      name: p.name,
      sales: p.sales,
      fill: p.name === 'PrintPilot' ? "var(--color-print)" : p.name === 'StickerPilot' ? "var(--color-sticker)" : "var(--color-time)",
    }));

  const handleAddProduct = (newProduct: Omit<Product, 'sales'>) => {
    setProducts(prev => [...prev, { ...newProduct, sales: 0 }]);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your SaaS products and view their performance.</p>
        </div>
        <AddProductDialog onAddProduct={handleAddProduct}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Product
          </Button>
        </AddProductDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Performance</CardTitle>
          <CardDescription>A look at the sales performance of your active products.</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
              <Bar dataKey="sales" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Product List</CardTitle>
          <CardDescription>All products in the Pilot Suite.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Sales</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.name}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Badge variant={product.status === 'Active' ? 'default' : (product.status === 'In Development' ? 'secondary': 'destructive')}>{product.status}</Badge>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-right">${product.sales.toLocaleString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Pause</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
