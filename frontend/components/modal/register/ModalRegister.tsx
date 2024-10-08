import React, { useRef, useState, useEffect, Key } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Autocomplete, AutocompleteItem} from "@nextui-org/react";
import { useJwtToken } from "@/hooks/useJwtToken";

import { DateTime } from "next-auth/providers/kakao";
import { Book } from "@mui/icons-material";

export default function ModalRegister({ isOpen, onClose }: any) {
  const formRef = useRef<HTMLFormElement>(null);
  const [showMessage, setShowMessage] = useState(false);
  const messageConfirmation = 'Cadastrado com sucesso.';
  const [errors, setErrors] = useState<{ nomeLeitor?: string, nomeLivro?: string, nomeExemplar?: string, dataEntrega?: DateTime }>({});
  const [authors, setAuthors] = useState<Array<{id: number, nome?: string; endereco?: string; email?: string; afiliacao?: string; dataNascimento?: string; telefone?: string }>>([]);
  const [books, setBooks] = useState<Array<{ id: string; nome: string; categoria: string; autor: string; status: string; exemplares: exemplar[] }>>([]);
  const [exemplares, setExemplares] = useState<exemplar[]>([])

  const [name, setName] = useState<Key>('');
  const [livro, setBook] = useState<Key>('');
  const [exemplar, setExemplar] = useState<Key>('');
  

  const today = new Date();

  const [deliveryDate, setDeliveryDate] = useState((today.getDate()+15).toString());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate());
  const minDate = tomorrow.toISOString().split('T')[0];


  // Get token
  const token = useJwtToken();

  // Fetch authors and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(deliveryDate)
        const resReaders = await fetch('http://localhost:8081/leitores', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const resBooks = await fetch('http://localhost:8081/livros', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (resReaders.ok && resBooks.ok) {
          const dataAuthors = await resReaders.json();
          const dataBooks = await resBooks.json();
          setAuthors(dataAuthors);
          setBooks(dataBooks);
        }
      } catch (error) {
        console.error("Error fetching books or readers:", error);
      }
    };

    fetchData();
  }, [token]);

  const handleSelectBook = async (livroID: Key) => {
    console.log(livroID)
      try {
        const resExemplar = await fetch(`http://localhost:8081/exemplares/livro/${livroID.toString()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (resExemplar.ok) {
          const dataExemplares = await resExemplar.json();
          setExemplares(dataExemplares)
        }
      } catch (error) {
        console.error("Error fetching exemplares:", error);
      }
    }

    // Validate form fields
    const validateForm = () => {
      const newErrors = {} as { nomeLeitor?: string, nomeLivro?: string, dataEntrega?: DateTime };

      if (!name) {
        newErrors.nomeLeitor = 'Campo obrigatório.';
      }

      if (!livro) {
        newErrors.nomeLivro = 'Campo obrigatório.';
      }

      if (!deliveryDate) {
        newErrors.dataEntrega = 'Campo obrigatório.';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    // Close modal
    const handleClose = () => {
      onClose();
    };

    // POST register
    async function handleAddRegister() {
      try {
        if (!token) {
          alert('Ação não permitida pelo usuário!');
          return;
        }

        if (!validateForm()) {
          return;
        }

        const register = {
          exemplar: exemplar,
          leitor: parseInt(name.toString()),
          dataDevolucao: deliveryDate,
        };

        const res = await fetch('http://localhost:8081/emprestimos', {
          method: 'POST',
          body: JSON.stringify(register),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          setShowMessage(true);
          formRef.current?.reset();
          setName('');
          setDeliveryDate('');
          setTimeout(() => setShowMessage(false), 3000);
        }

      } catch (e) {
        console.error('Erro ao adicionar registro:', e);
      }
    }

    return (
      <>
        <Modal isOpen={isOpen} onOpenChange={onClose} placement="top-center" isDismissable={false} isKeyboardDismissDisabled={true}>
          <form onSubmit={(e) => { e.preventDefault(); handleAddRegister(); }} ref={formRef}>
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1 text-lg">
                    Novo empréstimo
                    {showMessage && <p className="text-green-600 text-sm fixed mt-7">{messageConfirmation}</p>}
                  </ModalHeader>
                  <ModalBody>

                    <div> {/* Author Input */}
                      {errors.nomeLeitor && <p className="text-red-500 text-xs absolute right-8 mt-7">{errors.nomeLeitor}</p>}
                      <Autocomplete
                        label="Leitor"
                        placeholder="Selecione o nome do leitor"
                        variant="bordered"
                        defaultItems={authors}
                        allowsCustomValue={true}
                        onSelectionChange = {(id) => {setName(id)}}
                      >
                        {(item) =>

                          <AutocompleteItem key={item.id.toString()}>
                            {item.nome}
                          </AutocompleteItem>
                        }
                      </Autocomplete>

                    </div>

                    <div> {/* Livro Input */}
                      {errors.nomeLivro && <p className="text-red-500 text-xs absolute right-8 mt-7">{errors.nomeLivro}</p>}
                      <Autocomplete
                        label="Livro"
                        placeholder="Selecione o Livro"
                        variant="bordered"
                        defaultItems={books.filter((book)=> book.exemplares.length>0)}
                        allowsCustomValue={true}
                        onSelectionChange = {(id) => {setBook(id); handleSelectBook(id)}}
                      >
                        {(item) =>
                          <AutocompleteItem key={item.id.toString()}>
                            {item.nome}
                          </AutocompleteItem>
                        }
                      </Autocomplete>
                    </div>

                    {exemplares.filter((exemplar) => exemplar.estado=="DISPONIVEL").length>0 &&
                      <div> {/* Exemplar Input */}
                        {errors.nomeExemplar && <p className="text-red-500 text-xs absolute right-8 mt-7">{errors.nomeExemplar}</p>}
                        <Autocomplete
                          label="Exemplar"
                          placeholder="Selecione um Exemplar"
                          variant="bordered"
                          allowsCustomValue={true}
                          defaultItems={exemplares.filter((exemplar) => exemplar.estado=="DISPONIVEL")}
                          onSelectionChange = {(id) => {setExemplar(id)}}
                        >
                          {(item) =>

                              <AutocompleteItem key={item.id.toString()}>
                                {item.id}
                              </AutocompleteItem>
                            
                          }
                        </Autocomplete>
                      </div>
                    }

                    <div> {/* Delivery Date Input */}
                      {errors.dataEntrega && <p className="text-red-500 text-xs absolute right-8 mt-7">{errors.dataEntrega}</p>}
                      <Input
                        label="Data de Entrega"
                        type="date"
                        min={minDate}
                        placeholder="Selecione a data de entrega"
                        variant="bordered"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                      />
                    </div>

                  </ModalBody>
                  <ModalFooter>
                    <Button color="danger" variant="flat" onPress={handleClose}>
                      Cancelar
                    </Button>
                    <Button color="primary" type="submit">
                      Cadastrar
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </form>
        </Modal>


      </>
    );
  }
