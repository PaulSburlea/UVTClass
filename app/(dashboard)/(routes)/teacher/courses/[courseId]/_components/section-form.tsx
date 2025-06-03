"use client";

import * as z from "zod";
import axios from "axios";
import { toast } from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import {useForm } from "react-hook-form";
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
    FormMessage
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface SectionFormProps {
    initialData: Classroom;
    courseId: string;
};

const formSchema = z.object({ 
    section: z.string().min(1, {
        message: "Descrierea este obligatorie"
    }),
});


export const SectionForm = ({
    initialData,
    courseId
}: SectionFormProps) => {
    const [isEditing, setIsEditing] = useState(false);

    const toggleEdit = () => setIsEditing((current) => !current);

    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            section: initialData?.section || ""
        }
    });

    const { isSubmitting, isValid } = form.formState;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axios.patch(`/api/courses/${courseId}`, values);
            toast.success("Descrierea cursului a fost actualizată cu succes.");
            toggleEdit();
            router.refresh();
        } catch {
            toast.error("A apărut o eroare la actualizarea descrierii cursului.");
        }
    }

    return (
        <div className="mt-6 border bg-slate-100 rounded-md p-4">
            <div className="font-medium flex items-center justify-between">
                Descrierea cursului
                <Button onClick={toggleEdit} variant="ghost">
                    {isEditing ? (
                        <>Anulează</>
                    ) : (
                        <>
                            <Pencil className="h-4 w-4 mr-2"/>
                            Editează descrierea
                        </>
                    )}
                </Button>
            </div>
            {!isEditing && (
                <p className={cn(
                    "text-sm mt-2",
                    !initialData.section && "text-slate-500 italic"
                ) }>
                    {initialData.section || "Fără descriere definită"}
                </p>
            )}

            {isEditing && (
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4 mt-4"
                        >
                            <FormField 
                                control={form.control}
                                name="section"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Textarea 
                                                disabled={isSubmitting}
                                                placeholder="Descrierea cursului"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex items-center gap-x-2">
                                <Button
                                    disabled={!isValid || isSubmitting}
                                    type="submit"
                                >
                                    Salvează
                                </Button>
                            </div>
                    </form>
                </Form>
            )}
        </div>
    )
}
