package br.com.fluxoteca.backend.controller;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import br.com.fluxoteca.backend.dto.Leitor.AtualizacaoLeitorDto;
import br.com.fluxoteca.backend.dto.Leitor.CriacaoLeitorDto;
import br.com.fluxoteca.backend.dto.Leitor.LeitorResponseDto;
import br.com.fluxoteca.backend.model.Leitor;
import br.com.fluxoteca.backend.repository.LeitorRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/leitores")
@Tag(name="Leitores")
public class LeitorController {
    
    @Autowired
    private LeitorRepository leitorRepository;

    @PostMapping
    @Transactional
    @Operation(summary = "Cria um leitor")
    public ResponseEntity<LeitorResponseDto> criar(@RequestBody @Valid CriacaoLeitorDto data, UriComponentsBuilder uriBuilder){
        Leitor leitor = new Leitor();
        BeanUtils.copyProperties(data, leitor);

        leitorRepository.save(leitor);

        var uri = uriBuilder.path("Leitors/{id}").buildAndExpand(leitor.getId()).toUri();

        return ResponseEntity.created(uri).body(new LeitorResponseDto(leitor));
    }
    

    @GetMapping
    @Operation(summary = "Lista todos os leitores")
    public ResponseEntity<List<LeitorResponseDto>> listar(){

        var leitorsList = leitorRepository.findAll().stream().map(LeitorResponseDto::new).toList();

        return ResponseEntity.ok(leitorsList);
    }

    @PutMapping
    @Transactional
    @Operation(summary = "Atualiza um leitor")
    public ResponseEntity<LeitorResponseDto> atualizar(@RequestBody @Valid AtualizacaoLeitorDto data){
        var Leitor = leitorRepository.getReferenceById(data.id());
        Leitor.atualizarInformacao(data);

        return ResponseEntity.ok(new LeitorResponseDto(Leitor));

    }

    @DeleteMapping("/{id}")
    @Transactional
    @Operation(summary = "Deleta um leitor")
    public ResponseEntity<Void> deletar(@PathVariable Long id){
        var Leitor = leitorRepository.getReferenceById(id);
        Leitor.inativar();
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    @Transactional
    @Operation(summary = "Reativa um leitor")
    public void reativar(@PathVariable Long id){
        var Leitor = leitorRepository.getReferenceById(id);
        Leitor.ativar();
    }

}
