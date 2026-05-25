"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function FBIComplaintPage():  {
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    setSubmitting(true);

    // Simulate sending complaint (replace with your API logic)
    setTimeout(() => {
      toast.success("Your complaint has been submitted!");

      setFullName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setContactEmail("");

      setSubmitting(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-8">
      <div className="max-w-3xl mx-auto py-10 px-4 sm:px-8">
        <h1 className="text-3xl font-bold text-primary mb-2">
          FBI Complaint Center
        </h1>

        <p className="text-muted-foreground mb-8">
          If you have any complaints, concerns, or wish to report
          suspicious activity, please fill out the form below.
          Our team will review and respond as soon as possible.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-card rounded-2xl shadow-lg p-6 border border-border"
        >
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-muted-foreground mb-1"
            >
              Full Name
            </label>

            <Input
              id="fullName"
              name="fullName"
              type="text"
              required
              value={fullName}
              onChange={(
                e: ChangeEvent<HTMLInputElement>
              ) => setFullName(e.target.value)}
              className="bg-card/50 text-foreground border-border placeholder-muted-foreground"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-muted-foreground mb-1"
            >
              Your Email
            </label>

            <Input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(
                e: ChangeEvent<HTMLInputElement>
              ) => setEmail(e.target.value)}
              className="bg-card/50 text-foreground border-border placeholder-muted-foreground"
              placeholder="you@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="contactEmail"
              className="block text-sm font-medium text-muted-foreground mb-1"
            >
              Contact Email
            </label>

            <Input
              id="contactEmail"
              name="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(
                e: ChangeEvent<HTMLInputElement>
              ) => setContactEmail(e.target.value)}
              className="bg-card/50 text-foreground border-border placeholder-muted-foreground"
              placeholder="Optional contact email"
            />
          </div>

          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-muted-foreground mb-1"
            >
              Subject
            </label>

            <Input
              id="subject"
              name="subject"
              type="text"
              required
              value={subject}
              onChange={(
                e: ChangeEvent<HTMLInputElement>
              ) => setSubject(e.target.value)}
              className="bg-card/50 text-foreground border-border placeholder-muted-foreground"
              placeholder="Complaint subject"
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-muted-foreground mb-1"
            >
              Message
            </label>

            <Textarea
              id="message"
              name="message"
              required
              rows={5}
              value={message}
              onChange={(
                e: ChangeEvent<HTMLTextAreaElement>
              ) => setMessage(e.target.value)}
              className="bg-card/50 text-foreground border-border placeholder-muted-foreground"
              placeholder="Describe your complaint or issue in detail..."
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground font-semibold py-2 rounded-lg shadow-lg shadow-primary/25 hover:opacity-90 transition disabled:opacity-50"
            disabled={submitting}
          >
            {submitting
              ? "Submitting..."
              : "Submit Complaint"}
          </Button>
        </form>
      </div>
    </div>
  );
}