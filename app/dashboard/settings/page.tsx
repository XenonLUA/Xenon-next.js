"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function SettingPage() {
  const formRef = useRef();
  const scrollRef = useRef();
  const [newName, setNewName] = useState("");
  const [newCoinPrice, setNewCoinPrice] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newPhotoPath, setNewPhotoPath] = useState("");
  const [updating, setUpdating] = useState(false);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [coinData, setCoinData] = useState(null);
  const [newCoinAmount, setNewCoinAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [items, setItems] = useState([]);

  const supabaseUrl = "https://sqgifjezpzxplyvrrtev.supabase.co";
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZ2lmamV6cHp4cGx5dnJydGV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTMzNDc2NzQsImV4cCI6MjAyODkyMzY3NH0.2yYEUffqta76luZ5mUF0pwgWNx3iEonvmxxr1KJge68";
  const supabase = createClient(supabaseUrl, supabaseKey);

  useEffect(() => {
    fetchCoinData();
    fetchItems();
  }, []);

  const fetchCoinData = async () => {
    try {
      setLoading(true);
      console.log("Fetching coin data...");
      const { data, error } = await supabase
        .from("coin")
        .select("harga, koin_tersedia")
        .single();
      if (error) throw error;
      setCoinData(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching coin data:", error.message);
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      console.log("Fetching items...");
      const { data, error } = await supabase.from("item").select("*");
      if (error) throw error;
      setItems(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching items:", error.message);
      setLoading(false);
    }
  };

  const updatePriceAndAmount = async () => {
    try {
      setSending(true);
      console.log("Updating price and amount...");
      await supabase
        .from("coin")
        .update({ harga: newCoinPrice, koin_tersedia: newCoinAmount })
        .eq("id", 4);
      fetchCoinData();
      setSending(false);
      console.success('Price and amount updated successfully'); // Tambahkan console success
    } catch (error) {
      console.error("Error updating price and amount:", error.message);
      setSending(false);
      console.error('Failed to update price and amount'); // Tambahkan console error
    }
  };

  const addItemToDatabase = async () => {
    try {
      setAdding(true);
      console.log("Adding item to database...");
      await supabase
        .from("item")
        .insert([
          { name: newName, price: newItemPrice, photopath: newPhotoPath },
        ]);
      fetchItems();
      setAdding(false);
      console.success('Item added successfully'); // Tambahkan console success
    } catch (error) {
      console.error("Error adding item to database:", error.message);
      setAdding(false);
      console.error('Failed to add item'); // Tambahkan console error
    }
  };

  const deleteItemFromDatabase = async (itemId) => {
    try {
      setLoading(true);
      console.log("Deleting item from database...");
      await supabase.from("item").delete().eq("id", itemId);
      fetchItems();
      setLoading(false);
      console.success('Item deleted successfully'); // Tambahkan console success
    } catch (error) {
      console.error("Error deleting item from database:", error.message);
      setLoading(false);
      console.error('Failed to delete item'); // Tambahkan console error
    }
  };

  const handleNameChange = (e) => {
    setNewName(e.target.value);
  };

  const handlePriceChange = (e) => {
    setNewCoinPrice(e.target.value);
  };

  const handleItemPrice = (e) => {
    setNewItemPrice(e.target.value);
  };

  const handlePhotoPathChange = (e) => {
    setNewPhotoPath(e.target.value);
  };

  const handleAmountChange = (e) => {
    setNewCoinAmount(e.target.value);
  };

  return (
    <div className="grid items-start gap-8">
      <div className="flex items-center justify-between px-2">
        <div className="grid gap-1">
          <h1 className="text-3xl md:text-4xl">Settings</h1>
        </div>
      </div>

      <Card>
        <form>
          <CardHeader>
            <CardTitle>Coin ZEPETOBOT</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="space-y-1">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Edit Coin</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Edit Coin</DialogTitle>
                      <DialogDescription>
                        Make changes to your coin here. Click save when you're
                        done.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          HARGA
                        </Label>
                        <Input
                          type="text"
                          name="coin"
                          placeholder={`Enter new price ${
                            coinData ? `(${coinData.harga})` : ""
                          }`}
                          value={newCoinPrice}
                          onChange={handlePriceChange}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">
                          KOIN TERSEDIA
                        </Label>
                        <Input
                          type="text"
                          placeholder={`Enter new coin amount ${
                            coinData ? `(${coinData.koin_tersedia})` : ""
                          }`}
                          value={newCoinAmount}
                          onChange={handleAmountChange}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      {sending ? (
                        <Progress />
                      ) : (
                        <Button onClick={updatePriceAndAmount}>
                          Update Price and Amount
                        </Button>
                      )}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </form>
        <form>
          <CardHeader>
            <CardTitle>Add Item</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="space-y-1">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Edit Item</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add Item List</DialogTitle>
                      <DialogDescription>
                        Make changes to your item here. Click save when you're
                        done.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <Input
                          type="text"
                          name="item"
                          placeholder="Enter item name"
                          value={newName}
                          onChange={handleNameChange}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">
                          Item Price
                        </Label>
                        <Input
                          type="text"
                          placeholder={`Enter item price`}
                          value={newItemPrice}
                          onChange={handleItemPrice}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">
                          Photo Path
                        </Label>
                        <Input
                          type="text"
                          placeholder="Enter item photo path"
                          value={newPhotoPath}
                          onChange={handlePhotoPathChange}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      {adding ? (
                        <Progress />
                      ) : (
                        <Button onClick={addItemToDatabase}>
                        </Button>
                      )}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}