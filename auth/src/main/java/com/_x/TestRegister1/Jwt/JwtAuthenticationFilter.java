package com._x.TestRegister1.Jwt;

import com._x.TestRegister1.DTO.ErrorResponse;
import com._x.TestRegister1.Service.CustomUserDetailsService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.security.SignatureException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;


    public JwtAuthenticationFilter(JwtService jwtService, CustomUserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
        final String authHeader=request.getHeader("Authorization");

        if(authHeader==null || !authHeader.startsWith("Bearer ")){
            filterChain.doFilter(request,response);
            return;
        }
        try {
            final String jwt=authHeader.substring(7);

            if (jwt.trim().isEmpty()) {
                filterChain.doFilter(request, response);
                return;
            }

            final String username = jwtService.extractUsername(jwt);

            if(username != null && SecurityContextHolder.getContext()
                    .getAuthentication()==null){
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                if(jwtService.isTokenValid(jwt,userDetails)){
                    UsernamePasswordAuthenticationToken authToken=
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (ExpiredJwtException e) {
            logger.warn("JWT токен просрочен: {}", e);
            new ErrorResponse("Token expired");
            return;
        } catch (MalformedJwtException e) {
            logger.warn("Неверный формат JWT токена: {}", e);
            new ErrorResponse("Invalid token format");
            return;
        } catch (Exception e) {
            e.printStackTrace();
        }
        filterChain.doFilter(request,response);

    }

}
