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
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import br.com.fluxoteca.backend.dto.Usuario.AtualizacaoUsuarioDto;
import br.com.fluxoteca.backend.dto.Usuario.CriacaoUsuarioDto;
import br.com.fluxoteca.backend.dto.Usuario.UsuarioResponseDto;
import br.com.fluxoteca.backend.model.Usuario;
import br.com.fluxoteca.backend.repository.UsuarioRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.RequestMapping;


@RestController
@RequestMapping("/usuarios")
public class UsuarioController {
    
    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping
    @Transactional
    public ResponseEntity<UsuarioResponseDto> criar(@RequestBody @Valid CriacaoUsuarioDto data, UriComponentsBuilder uriBuilder){
        Usuario usuario = new Usuario();
        BeanUtils.copyProperties(data, usuario);

        usuarioRepository.save(usuario);

        var uri = uriBuilder.path("usuarios/{id}").buildAndExpand(usuario.getId()).toUri();

        return ResponseEntity.created(uri).body(new UsuarioResponseDto(usuario));
    }

    @GetMapping
    public ResponseEntity<List<UsuarioResponseDto>> listar(){

        var usuariosList = usuarioRepository.findAll().stream().map(UsuarioResponseDto::new).toList();

        return ResponseEntity.ok(usuariosList);
    }

    @PutMapping
    @Transactional
    public ResponseEntity<UsuarioResponseDto> atualizar(@RequestBody @Valid AtualizacaoUsuarioDto data){
        var usuario = usuarioRepository.getReferenceById(data.id());
        usuario.atualizarInformacao(data);

        return ResponseEntity.ok(new UsuarioResponseDto(usuario));

    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deletar(@PathVariable Long id){
        var usuario = usuarioRepository.getReferenceById(id);
        usuario.inativar();
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    @Transactional
    public void reativar(@PathVariable Long id){
        var usuario = usuarioRepository.getReferenceById(id);
        usuario.ativar();
    }
}
