"use client";

import React, { useState, useEffect, useRef, ChangeEvent, useCallback } from "react";
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
  const formRef = useRef<HTMLFormElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [newName, setNewName] = useState<string>("");
  const [newCoinPrice, setNewCoinPrice] = useState<string>("");
  const [newItemPrice, setNewItemPrice] = useState<string>("");
  const [newPhotoPath, setNewPhotoPath] = useState<string>("");
  const [updating, setUpdating] = useState<boolean>(false);
  const [adding, setAdding] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [coinData, setCoinData] = useState<any>(null);
  const [newCoinAmount, setNewCoinAmount] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const [items, setItems] = useState<any[]>([]);

  const supabaseUrl: string = "https://sqgifjezpzxplyvrrtev.supabase.co";
  const supabaseKey: string =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZ2lmamV6cHp4cGx5dnJydGV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTMzNDc2NzQsImV4cCI6MjAyODkyMzY3NH0.2yYEUffqta76luZ5mUF0pwgWNx3iEonvmxxr1KJge68";
  const supabase = createClient(supabaseUrl, supabaseKey);

  const fetchCoinData = useCallback(async () => {
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
      console.error("Error fetching coin data:", error);
      setLoading(false);
    }
  }, [supabase]);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching items...");
      const { data, error } = await supabase.from("item").select("*");
      if (error) throw error;
      setItems(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching items:", error);
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchCoinData();
    fetchItems();
  }, [fetchCoinData, fetchItems]);

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
      console.log("Price and amount updated successfully");
    } catch (error) {
      console.error("Error updating price and amount:", error);
      setSending(false);
      console.error("Failed to update price and amount");
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
      console.log("Item added successfully");
    } catch (error) {
      console.error("Error adding item to database:", error);
      setAdding(false);
      console.error("Failed to add item");
    }
  };

  const deleteItemFromDatabase = async (itemId: number) => {
    try {
      setLoading(true);
      console.log("Deleting item from database...");
      await supabase.from("item").delete().eq("id", itemId);
      fetchItems();
      setLoading(false);
      console.log("Item deleted successfully");
    } catch (error) {
      console.error("Error deleting item from database:", error);
      setLoading(false);
      console.error("Failed to delete item");
    }
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value);
  };

  const handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewCoinPrice(e.target.value);
  };

  const handleItemPrice = (e: ChangeEvent<HTMLInputElement>) => {
    setNewItemPrice(e.target.value);
  };

  const handlePhotoPathChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewPhotoPath(e.target.value);
  };

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
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
                    <Button>Add Item</Button>
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
                          Add Item
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