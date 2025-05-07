"use client";

import * as z from "zod";
import axios from "axios";
import { toast } from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import {useForm } from "react-hook-form";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TtileFormProps {
    initialData: {
        name: string;
    };
    courseId: string;
};

const formSchema = z.object({ 
    name: z.string().min(1, {
        message: "Titlul este obligatoriu"
    }),
});


export const TitleForm = ({
    initialData,
    courseId
}: TtileFormProps) => {
    const [isEditing, setIsEditing] = useState(false);

    const toggleEdit = () => setIsEditing((current) => !current);

    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData
    });

    const { isSubmitting, isValid } = form.formState;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axios.patch(`/api/courses/${courseId}`, values);
            toast.success("Numele cursului a fost actualizat cu succes.");
            toggleEdit();
            router.refresh();
        } catch {
            toast.error("A apărut o eroare la actualizarea numelui cursului.");
        }
    }

    return (
        <div className="mt-6 border bg-slate-100 rounded-md p-4">
            <div className="font-medium flex items-center justify-between">
                Numele cursului
                <Button onClick={toggleEdit} variant="ghost">
                    {isEditing ? (
                        <>Anulează</>
                    ) : (
                        <>
                            <Pencil className="h-4 w-4 mr-2"/>
                            Editează numele
                        </>
                    )}
                </Button>
            </div>
            {!isEditing && (
                <p className="text-sm mt-2">
                    {initialData.name}
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
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input 
                                                disabled={isSubmitting}
                                                placeholder="Numele cursului"
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
