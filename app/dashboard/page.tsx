"use client";

import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const cors = require("cors");

interface Item {
  id: number;
  name: string;
  price: number;
  photopath: string;
}

interface CoinData {
  harga: number;
  koin_tersedia: number;
}

interface PaymentDetail {
  zpt_id: number;
  user_id: number;
  username: string;
  item: string;
  terkirim: string;
  timestamp: string;
}

const DashboardPage = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loadingItems, setLoadingItems] = useState<boolean>(false);
  const [coinData, setCoinData] = useState<CoinData | null>(null);
  const [loadingCoin, setLoadingCoin] = useState<boolean>(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetail[]>([]);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  const supabaseUrl = "https://sqgifjezpzxplyvrrtev.supabase.co";
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZ2lmamV6cHp4cGx5dnJydGV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTMzNDc2NzQsImV4cCI6MjAyODkyMzY3NH0.2yYEUffqta76luZ5mUF0pwgWNx3iEonvmxxr1KJge68";
  const supabase = createClient(supabaseUrl, supabaseKey);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoadingItems(true);
        const { data, error } = await supabase.from("item").select("*");
        if (error) throw error;
        setItems(data);
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoadingItems(false);
      }
    };

    const fetchCoinData = async () => {
      try {
        setLoadingCoin(true);
        const { data, error } = await supabase
          .from("coin")
          .select("harga, koin_tersedia")
          .single();
        if (error) throw error;
        setCoinData(data);
      } catch (error) {
        console.error("Error fetching coin data:", error);
      } finally {
        setLoadingCoin(false);
      }
    };

    const fetchPaymentDetails = async () => {
      try {
        setLoadingDetails(true);
        const { data, error } = await supabase
          .from("payment_details")
          .select("*");
        if (error) throw error;
        setPaymentDetails(data);
      } catch (error) {
        console.error("Error fetching payment details:", error);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchItems();
    fetchCoinData();
    fetchPaymentDetails();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array

  const handleDeleteItem = async (itemId: number) => {
    try {
      const { error } = await supabase.from("item").delete().eq("id", itemId);
      if (error) throw error;
      // Remove item from local state without fetching again
      setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  return (
    <div className="grid items-start gap-8">
      <div className="flex items-center justify-between px-2">
        <div className="grid gap-1">
          <h1 className="text-3xl md:text-4xl">All Data</h1>
        </div>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Coin ZEPETOBOT</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="space-y-1">
              <div className="console-content">
                {loadingCoin && <p>Loading coin data...</p>}
                {coinData && (
                  <div>
                    <p>Current Price: {coinData.harga}</p>
                    <p>Available Coins: {coinData.koin_tersedia}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>

        <CardHeader className="flex items-center justify-between">
          <CardTitle>ITEM</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="space-y-1">
              <Table>
                <TableCaption>A list of items</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Photo Path</TableHead>
                    <TableHead>Action</TableHead> {/* Add Action column */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingItems ? (
                    <TableRow>
                      <TableCell colSpan={5}>Loading...</TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.price}</TableCell>
                        <TableCell>{item.photopath}</TableCell>
                        <TableCell>
                          <button onClick={() => handleDeleteItem(item.id)}>
                            Delete
                          </button>{" "}
                          {/* Add Delete button */}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4}>Total</TableCell>
                    <TableCell className="text-right">
                      {/* Fill with total price */}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </div>
        </CardContent>

        <CardHeader className="flex items-center justify-between">
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>A list of payment details</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Zpt ID</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Delivered</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingDetails ? (
                <TableRow>
                  <TableCell colSpan={6}>Loading...</TableCell>
                  {/* Sesuaikan jumlah kolom */}
                </TableRow>
              ) : (
                paymentDetails.map((detail) => (
                  <TableRow key={detail.zpt_id}>
                    <TableCell>{detail.user_id}</TableCell>
                    <TableCell>{detail.username}</TableCell>
                    <TableCell>{detail.zpt_id}</TableCell>
                    <TableCell>{detail.item}</TableCell>
                    <TableCell>{detail.terkirim}</TableCell>
                    <TableCell>{detail.timestamp}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
