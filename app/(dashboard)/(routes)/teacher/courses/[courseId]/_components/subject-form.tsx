"use client";

import * as z from "zod";
import axios from "axios";
import { toast } from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import type { Classroom } from "@/app/types/classroom";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SubjectFormProps {
  initialData: Classroom;
  courseId: string;
}

// Schema pentru validarea câmpului "subject"
const formSchema = z.object({
  subject: z.string().min(1, {
    message: "Subiectul este obligatoriu",
  }),
});

export const SubjectForm = ({ initialData, courseId }: SubjectFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: initialData?.subject || "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  // Trimite PATCH pentru actualizarea subiectului cursului
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/courses/${courseId}`, values);
      toast.success("Subiectul a fost actualizat cu succes.");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("A apărut o eroare la actualizarea subiectului.");
    }
  };

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4 sm:p-6">
      {/* Header secțiune cu buton de toggle edit */}
      <div className="font-medium flex items-center justify-between">
        <span className="text-base sm:text-lg">Subiectul cursului</span>
        <Button
          onClick={toggleEdit}
          variant="ghost"
          className="flex items-center space-x-1"
        >
          {isEditing ? (
            <span className="truncate whitespace-nowrap">Anulează</span>
          ) : (
            <>
              <Pencil className="h-4 w-4" />
              <span className="hidden sm:inline truncate whitespace-nowrap">
                Editează subiectul
              </span>
              <span className="inline sm:hidden truncate whitespace-nowrap">
                Editează
              </span>
            </>
          )}
        </Button>
      </div>

      {/* Afișare read-only când nu suntem în modul edit */}
      {!isEditing && (
        <p
          className={cn(
            "text-sm mt-2",
            !initialData.subject && "text-slate-500 italic truncate"
          )}
        >
          {initialData.subject || "Fără subiect definit"}
        </p>
      )}

      {/* Formular de editare când suntem în modul edit */}
      {isEditing && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      data-cy="input-subject"
                      className="w-full"
                      disabled={isSubmitting}
                      placeholder="Ex: Programare, Logică, Discuții..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col gap-y-2 sm:flex-row sm:gap-x-2">
              <Button
                disabled={!isValid || isSubmitting}
                type="submit"
                className="w-full sm:w-auto truncate whitespace-nowrap"
              >
                Salvează
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
