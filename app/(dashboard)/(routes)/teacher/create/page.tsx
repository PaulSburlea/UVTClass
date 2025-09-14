"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { mutate } from "swr";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
  FormItem,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import toast from "react-hot-toast";

// Schema de validare cu Zod: numele cursului este obligatoriu
const FormSchema = z.object({
  name: z.string().min(1, {
    message: "Titlul este obligatoriu",
  }),
});

const CreatePage = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  // Handler-ul la submit: trimite datele și actualizează lista de cursuri
  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    try {
      const response = await axios.post("/api/courses", values);

      await mutate("/api/courses");

      toast.success("Curs creat cu succes!");
      router.push(`/teacher/courses/${response.data.id}/edit`);
    } catch {
      toast.error("Ceva nu a funcționat!");
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex md:items-center md:justify-center h-full p-6">
      <div>
        <h1 className="text-2xl">Denumiți-vă cursul</h1>
        <p className="text-sm text-slate-600">
          Cum ai vrea să-ți denumești cursul? Îl poți schimba oricând mai târziu.
        </p>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 mt-8"
          >
            {/* Câmpul pentru numele cursului, cu label, descriere și mesaj de eroare */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numele cursului</FormLabel>
                  <FormControl>
                    <Input
                      data-cy="course-name"
                      disabled={isSubmitting}
                      placeholder="e.g. 'Programare web'"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Ce vei preda in acest curs?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Butoanele de acțiune: Anulează (link) și Înainte (submit) */}
            <div className="flex items-center gap-x-2">
              <Link href="/">
                <Button type="button" variant="ghost">
                  Anulați
                </Button>
              </Link>
              <Button type="submit" disabled={!isValid || isSubmitting}>
                Înainte
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreatePage;
