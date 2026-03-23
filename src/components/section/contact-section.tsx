"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  AnimatedButton,
  ButtonStatus,
} from "@/components/magicui/animated-button";
import { CheckIcon, ChevronRightIcon, MailIcon, TriangleAlert } from "lucide-react";
import { Button } from "../ui/button";

interface FormData {
  name: string;
  email: string;
  message: string;
}

export default function ContactMe() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });

  const [statusMessage, setStatusMessage] = useState<string>("");
  const [buttonStatus, setButtonStatus] = useState<ButtonStatus>("idle");

  // Handle input changes
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Reset button status when user modifies the form
    if (buttonStatus !== "idle") {
      setButtonStatus("idle");
    }
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.message) {
      setStatusMessage("Please fill in all fields.");
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const url = process.env.NEXT_PUBLIC_CONTACT_API;
    if (!url) {
      throw new Error("The environment variable is not defined");
    }

    try {
      const response = await axios.post(url, formData, {
        headers: {
          Accept: "application/json",
        },
      });

      if (response.status === 200) {
        toast.success("Message sent successfully!", {
          description: "I will respond whenever I can.",
        });
        setButtonStatus("success"); // Update button status to success
        setFormData({ name: "", email: "", message: "" });

        // Reset the button status after 3 seconds
        setTimeout(() => setButtonStatus("idle"), 3000);
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Submission failed", {
        description: "Something went wrong. Please try again.",
      });
      setButtonStatus("error"); // Update button status to error

      // Reset the button status after 3 seconds
      setTimeout(() => setButtonStatus("idle"), 3000);
    }
  };

  return (
    <div className="space-y-3">
      <div className="inline-block rounded-lg bg-foreground text-background px-3 py-1 text-sm">
        Contact
      </div>
      <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
        Get in Touch
      </h2>
      <p className="mx-auto max-w-600px text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
        Want to chat? Just send me a message
        <br />
        and I&apos;ll respond whenever I can. I will ignore all soliciting.
      </p>
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md flex flex-col h-full">
        <form onSubmit={handleSubmit} className="space-y-4 grow">
          <Input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="border-muted"
          />
          <Input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="border-muted"
          />
          <Textarea
            name="message"
            placeholder="Message Here..."
            className="h-32 grow border-muted"
            value={formData.message}
            onChange={handleChange}
            required
          />
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1 rounded-md py-2.5 h-auto cursor-pointer" onClick={() => {
              const mailtoLink = `mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}?subject=Contact%20from%20Portfolio&body=Hi%20Sarun,`;
              window.open(mailtoLink, "_blank", "noopener,noreferrer");
            }}>
              <MailIcon className="mr-2 size-4" />
              Email
            </Button>
            <div className="flex flex-3">
              <AnimatedButton
                status={buttonStatus}
                initialText={
                  <span className="group inline-flex items-center">
                    Send Message{" "}
                    <ChevronRightIcon className="ml-1 size-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                }
                successText={
                  <span className="group inline-flex items-center">
                    <CheckIcon className="mr-2 size-4" />
                    Message Sent!{" "}
                  </span>
                }
                errorText={
                  <span className="group inline-flex items-center">
                    <TriangleAlert className="mr-2 size-4" />
                    Submission Failed{" "}
                  </span>
                }
              />
            </div>
          </div>
        </form>
        {statusMessage && (
          <p className="mt-2 text-sm text-red-600">{statusMessage}</p>
        )}
      </div>
    </div>
  );
}
