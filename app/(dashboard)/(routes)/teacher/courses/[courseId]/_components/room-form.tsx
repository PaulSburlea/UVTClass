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
import { Classroom } from "@prisma/client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface RoomFormProps {
  initialData: Classroom;
  courseId: string;
}

const formSchema = z.object({
  room: z.string().min(1, {
    message: "Sala este obligatorie",
  }),
});

export const RoomForm = ({
  initialData,
  courseId,
}: RoomFormProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      room: initialData?.room || "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/courses/${courseId}`, values);
      toast.success("Sala a fost actualizată cu succes.");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("A apărut o eroare la actualizarea sălii.");
    }
  };

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Sala cursului
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            <>Anulează</>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Editează sala
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <p
          className={cn(
            "text-sm mt-2",
            !initialData.room && "text-slate-500 italic"
          )}
        >
          {initialData.room || "Fără sala definită"}
        </p>
      )}

      {isEditing && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="room"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="Ex: A12, Sala 3, Online..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-2">
              <Button disabled={!isValid || isSubmitting} type="submit">
                Salvează
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
