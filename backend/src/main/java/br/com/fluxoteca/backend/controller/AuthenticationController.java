package br.com.fluxoteca.backend.controller;

import org.springframework.web.bind.annotation.RestController;

import br.com.fluxoteca.backend.dto.Authentication.TokenJWTDataDto;
import br.com.fluxoteca.backend.dto.Usuario.AutenticaLoginDto;
import br.com.fluxoteca.backend.dto.Usuario.UsuarioResponseDto;
import br.com.fluxoteca.backend.model.Usuario;
import br.com.fluxoteca.backend.service.TokenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;


@RestController
@RequestMapping("/login")
@CrossOrigin(origins = "*")
@Tag(name="Login")
public class AuthenticationController {
    
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private TokenService tokenService;

    @PostMapping
    @Operation(summary = "Realiza o login")
    public ResponseEntity<?> login(@RequestBody AutenticaLoginDto data) {
        
        var token = new UsernamePasswordAuthenticationToken(data.login(), data.senha());
        var autenticacao = authenticationManager.authenticate(token);
        
        var tokenJWT = tokenService.tokenGenerate((Usuario) autenticacao.getPrincipal());



        return ResponseEntity.ok(new TokenJWTDataDto(tokenJWT, new UsuarioResponseDto((Usuario) autenticacao.getPrincipal())));
    }
}
