"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { MissingPersonFormValues } from "@/lib/types";
import { missingPersonSchema } from "@/lib/types";
import {
  CalendarIcon,
  Loader2,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import React, { useState, useRef, useTransition } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { generateGuidanceAction, submitMissingPersonAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function MissingPersonForm() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const [guidance, setGuidance] = useState("");
  const [isLoadingGuidance, setIsLoadingGuidance] = useState(false);

  const form = useForm<MissingPersonFormValues>({
    resolver: zodResolver(missingPersonSchema),
    defaultValues: {
      name: "",
      age: 0,
      gender: undefined,
      lastSeenLocation: "",
      contactInfo: "",
      description: "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({
          variant: "destructive",
          title: "Image too large",
          description: "Please select an image smaller than 4MB.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const onSubmit = (values: MissingPersonFormValues) => {
    setFormError(null);
    setFormSuccess(null);

    const imageFile = fileInputRef.current?.files?.[0];
    if (!imageFile) {
      toast({
        variant: "destructive",
        title: "Image Required",
        description: "Please upload an image of the missing person.",
      });
      return;
    }
    
    startTransition(async () => {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onload = async () => {
        const base64Image = (reader.result as string).split(',')[1];
        const result = await submitMissingPersonAction(values, {data: base64Image, name: imageFile.name});
        if (result.isError) {
          setFormError(result.message);
        } else {
          setFormSuccess(result.message);
          form.reset();
          setImagePreview(null);
          if(fileInputRef.current) fileInputRef.current.value = "";
        }
      }
    });
  };

  const handleGetGuidance = async () => {
    setIsLoadingGuidance(true);
    setGuidance("");
    const values = form.getValues();
    const details = `Name: ${values.name || 'N/A'}, Age: ${values.age || 'N/A'}, Gender: ${values.gender || 'N/A'}, Last Seen Location: ${values.lastSeenLocation || 'N/A'}. Current description draft: "${values.description || ''}"`;

    const result = await generateGuidanceAction({ details });

    if (result.error) {
      toast({ variant: "destructive", title: "Error", description: result.error });
    } else if (result.guidance) {
      setGuidance(result.guidance);
    }
    setIsLoadingGuidance(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <Card className="lg:col-span-2 shadow-lg">
            <CardHeader>
              <CardTitle>Report a Missing Person</CardTitle>
              <CardDescription>
                Fill out the form below with as much detail as possible.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="35" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateLastSeen"
                  render={({ field }) => (
                    <FormItem className="flex flex-col pt-2">
                      <FormLabel>Date Last Seen</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="lastSeenLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Seen Location</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Central Park, near the fountain"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Include clothing, height, weight, hair color, and any distinguishing features."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                     <FormDescription>This will be shared publicly with volunteers.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                  control={form.control}
                  name="contactInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Information</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Local police department phone number"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A public contact for tips.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem>
                  <FormLabel>Image of Missing Person</FormLabel>
                  <FormControl>
                    <div
                      className="relative mt-2 flex justify-center rounded-lg border border-dashed border-input px-6 py-10"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {imagePreview ? (
                        <>
                          <Image
                            src={imagePreview}
                            alt="Image preview"
                            width={200}
                            height={200}
                            className="h-48 w-48 rounded-md object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              setImagePreview(null);
                              if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <div className="text-center">
                          <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                          <p className="mt-4 text-sm text-muted-foreground">
                            <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, WEBP up to 4MB
                          </p>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <Input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                    accept="image/png, image/jpeg, image/webp"
                  />
                  <FormMessage />
                </FormItem>
              </div>
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-4">
              {formSuccess && <Alert variant="default" className="border-green-500 text-green-700"><AlertTitle>Success!</AlertTitle><AlertDescription>{formSuccess}</AlertDescription></Alert>}
              {formError && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{formError}</AlertDescription></Alert>}
              <Button type="submit" disabled={isPending} className="w-full bg-accent hover:bg-accent/90">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Report
              </Button>
            </CardFooter>
          </Card>

          <div className="lg:col-span-1 space-y-8">
            <Card className="shadow-lg sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                  <Sparkles className="h-5 w-5 text-accent" />
                  AI Writing Assistant
                </CardTitle>
                <CardDescription>
                  Get help writing a clear and effective description.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  type="button"
                  onClick={handleGetGuidance}
                  disabled={isLoadingGuidance}
                  className="w-full"
                  variant="outline"
                >
                  {isLoadingGuidance ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Get Writing Advice
                </Button>
                {isLoadingGuidance && (
                   <div className="mt-4 space-y-2">
                     <div className="h-4 bg-muted rounded-full animate-pulse w-3/4"></div>
                     <div className="h-4 bg-muted rounded-full animate-pulse w-full"></div>
                     <div className="h-4 bg-muted rounded-full animate-pulse w-5/6"></div>
                   </div>
                )}
                {guidance && (
                  <div className="mt-4 rounded-md border bg-secondary/50 p-4 text-sm">
                    <p className="whitespace-pre-wrap font-sans">{guidance}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
