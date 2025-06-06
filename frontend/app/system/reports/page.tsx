"use client"
import DailyRegisterList from "@/components/reports/DailyRegisterList";
import ReportCard from "@/components/reports/ReportCard";
import { fetchReport } from "@/components/reports/dataReports";
import { fetchGenerateBackup } from "@/components/table/databook";
import { useJwtToken } from "@/hooks/useJwtToken";
import { useLogin } from "@/hooks/useLogin";
import {Button, ScrollShadow } from "@nextui-org/react"
import {Accordion, AccordionItem} from "@nextui-org/react";
import { fetchData } from "next-auth/client/_utils";
import { useRouter } from "next/navigation";
import { title } from "process";
import { useEffect, useState } from "react";

export default function Reports(){

    const router = useRouter();

    const login = useLogin();

    const token = useJwtToken();
    const [report, setReport] = useState<report | undefined>(undefined);

    const [showMessageConfimation, setShowMessageConfirmation] = useState(false);
    const messageConfirmation = 'Backup realizado com sucesso.'
    const [showMessageError, setShowMessageError] = useState(false);
    const messageError = 'Erro ao realizar backup'
    

    useEffect(() => {
        const fetchData = async () => {
          try {
            if (!token) return;
            const reportData = await fetchReport(token, router);
            setReport(reportData);
          } catch (error) {
            console.error("Error fetching books:", error);
          }
        };
    
        fetchData();
      }, [token]);

    const backupGenerate = async () =>{

      try{

        if (!token) return;
        await fetchGenerateBackup(token, router);
        setShowMessageConfirmation(true)
        setTimeout(() => setShowMessageConfirmation(false), 3000)
      }catch (error){
        setShowMessageError(true)
        console.error("Erro ao realizar backup: ", error);
        setTimeout(() => setShowMessageError(false), 3000)

      }

    }


    return(
        <div className="flex w-full flex-col p-5 gap-7">
            <header className="flex p-4 justify-between items-center">
                <h1 className="text-2xl">Relatório Semestral</h1>
                <p className="text-xl font-bold">Usuário: {login}</p>
                <Button className="bg-[#7B6ED6]" onPress={backupGenerate}>Gerar Backup</Button>
            </header>
            {showMessageConfimation && <p className="text-green-600 text-sm">{messageConfirmation}</p>}
            {showMessageError && <p className="text-red-600 text-sm">{messageError}</p>}
            <main className="flex justify-center gap-8" onChange={()=>{fetchData}}>
                <DailyRegisterList setReport={setReport}/>
                <section className="flex gap-2 flex-wrap w-[60rem] items-center">
                    <ReportCard 
                    title="Novos livros"
                    content={report?.novosLivros}
                    />
                    <ReportCard 
                    title="Novos Leitores"
                    content={report?.novosLeitores}
                    />
                    <ReportCard 
                    title="Novos Exemplares"
                    content={report?.novosExemplares}
                    />
                    <ReportCard 
                    title="Empréstimos Concluídos"
                    content={report?.emprestimosConcluidos}
                    />

                    <div className="flex flex-col p-4 justify-center rounded-md w-[33rem] h-64 shadow-large gap-3">
                        <b className="text-xl">Livro Mais Emprestado</b>
                        <p className="text-lg">{report?.livroMaisEmprestado==null ? "Não há dados o suficiente" : report?.livroMaisEmprestado.nome}</p>
                        <b className="text-xl">Categoria Mais Emprestada</b>
                        <p className="text-lg">{report?.categoriaMaisEmprestada==null ? "Não há dados o suficiente" : report?.categoriaMaisEmprestada.nome}</p>
                        <b className="text-xl">Leitor Mais Assíduo</b>
                        <p className="text-lg">{report?.leitorMaisAssiduo == null ? "Não há dados o suficiente" : report?.leitorMaisAssiduo.nome}</p>
                    </div>

                </section>
            </main>
            

        </div>

    )
}