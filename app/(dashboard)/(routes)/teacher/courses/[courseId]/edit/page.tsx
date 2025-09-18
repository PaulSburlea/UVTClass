export const dynamic = "force-dynamic";

import { IconBadge } from '@/components/icon-badge';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { LayoutDashboard } from 'lucide-react';
import { redirect } from 'next/navigation';

import { TitleForm } from '../_components/title-form';
import { SectionForm } from '../_components/section-form';
import { SubjectForm } from '../_components/subject-form';
import { RoomForm } from '../_components/room-form';
import { CourseFinalize } from '../_components/course-finalize';



const CourseIdPage = async (
    props: {
        params: Promise<{ courseId: string }>
    }
) => {
    const params = await props.params;
    const { userId } = await auth();

    // Verificam daca utilizatorul este autentificat
    if (!userId) {
        return redirect("/");
    }

    // Preluăm datele cursului din baza de date
    const course = await db.classroom.findUnique({
        where: {
            id: params.courseId
        }
    });

    // Dacă nu există cursul cu acel ID, redirecționăm la root
    if (!course) {
        return redirect("/");
    }

    // Verificăm câmpurile obligatorii pentru finalizare
    const requiredFields = [
        course.name,
        course.section,
        course.subject,
        course.room

    ];

    const totalFelds = requiredFields.length;
    const completedFields = requiredFields.filter(Boolean).length;

    const completionText = `(${completedFields}/${totalFelds})`;

    return (
        <div className='p-6'>
            {/* Header pagină */}
            <div className='flex items-center justify-between'>
                <div className='flex flex-col gap-y-2'>
                    <h1 className='text-2xl font-medium'>
                        Configurarea cursului
                    </h1>
                    <span className='text-sm text-slate-700'>
                        Completați toate câmpurile {completionText}
                    </span>
                </div>
            </div>

            {/* Formulare de configurare într-un grid responsive */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-16'>
                <div>
                    <div className='flex items-center gap-x-2'>
                        <IconBadge icon={LayoutDashboard} />
                        <h2 className='text-xl'>
                            Personalizați-vă cursul
                        </h2>
                    </div>

                    {/* Formularele pentru fiecare câmp al cursului */}
                    <TitleForm
                        initialData={course}
                        courseId={course.id}
                    />
                    <SectionForm
                        initialData={course}
                        courseId={course.id}
                    />
                    <SubjectForm
                        initialData={course}
                        courseId={course.id}
                    />
                    <RoomForm
                        initialData={course}
                        courseId={course.id}
                    />

                    {/* Butonul de finalizare, activat când toate câmpurile sunt completate */}
                    <CourseFinalize />
                </div>
            </div>
        </div>
    );
}

export default CourseIdPage;
