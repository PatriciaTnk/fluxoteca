import { fetchDeleteExemplar, fetchExemplarsByBook } from "@/components/exemplars/dataExemplar";
import { useJwtToken } from "@/hooks/useJwtToken";
import { Delete, Edit } from "@mui/icons-material";
import { Accordion, AccordionItem, Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ModalUpdateExemplar from "./ModalUpdateExemplar";

export default function ModalExemplarList({ isOpen, onClose, bookID }: any){

    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const token = useJwtToken()
    const [exemplars, setExemplars] = useState<exemplar[]>([])

    const [exemplar, setExemplar] = useState("")

    const [showModalUpdateExemplar, setShowModalUpdateExemplar] = useState(false);

    const handleClickUpdateExemplar = () => {
        setShowModalUpdateExemplar(true);
    }

    useEffect(() => {
        const fetchData = async () => {
        try {
            if (!token) return;
            const exemplarsData = await fetchExemplarsByBook(token, router, bookID)
            setExemplars(exemplarsData)
            setIsLoading(false)
        } catch (error) {
            console.error("Error fetching users:", error);
        }
        };
    
        fetchData();
    }, [token, isLoading]);

    async function handleClickDeleteExemplar(){
        try {
            
            setIsLoading(true)
            await fetchDeleteExemplar(token, router, exemplar)
            setIsLoading(false)



        } catch (error) {
            console.error("Error fetfdsafdsadsa:", error); 
        }
    }

    return(
        <>
            <Modal isOpen={isOpen} onOpenChange={onClose} placement="top-center" isDismissable={false} isKeyboardDismissDisabled={true}>
                <ModalContent>
                    {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 text-lg">
                            Lista de exemplares
                        </ModalHeader>
                        <ModalBody className="flex">

                            <b>Número de exemplares: {exemplars.length}</b>

                            <Accordion variant="splitted">
                                {exemplars.map((exemplar)=>(
                                    <AccordionItem key={exemplar.id} title={exemplar.id}>
                                        <b>Livro</b>
                                        <p>{exemplar.livro.nome}</p>
                                        <b>Localização</b>
                                        <p>{exemplar.localizacao}</p>
                                        <b>Estado</b>
                                        <p>{exemplar.estado}</p>
                                        <b>Status</b>
                                        <p>{exemplar.status ? "Ativo" : "Desativado"}</p>
                                        <div>
                                            <Button isIconOnly size="sm" variant="bordered" title="Alterar exemplar" onPress={()=>{
                                                setExemplar(exemplar.id)
                                                handleClickUpdateExemplar()}}>
                                                <Edit className="text-[#7B6ED6]" />
                                            </Button>
                                            <Button isIconOnly size="sm" variant="bordered" title="Deletar exemplar" onPress={()=>{
                                                setExemplar(exemplar.id)
                                                handleClickDeleteExemplar()
                                            }}>
                                                <Delete className="text-[#7B6ED6]" />
                                            </Button>
                                        </div>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                            {showModalUpdateExemplar && <ModalUpdateExemplar isOpen={showModalUpdateExemplar} onClose={() => {
                                setShowModalUpdateExemplar(false)
                                setIsLoading(true);
                            }} exemplarID={exemplar}/>}
                        </ModalBody>
                        <ModalFooter>
                        </ModalFooter>
                    </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}