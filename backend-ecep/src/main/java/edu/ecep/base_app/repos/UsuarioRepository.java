package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
    Boolean existsByEmail(String email);



    /*
    @Query("""
        SELECT 
            u.id as idUsuario,
            u.email as email,
            u.roles as roles,
            p.id as idPersona,
            CONCAT(p.nombre, ' ', p.apellido) as nombreCompleto,
            p.dni as dni,
            TYPE(p).name as tipoPersona
        FROM Usuario u
        LEFT JOIN u.persona p
        WHERE u.id <> :currentId
          AND (
              LOWER(u.email) LIKE LOWER(CONCAT('%', :q, '%'))
           OR LOWER(p.nombre) LIKE LOWER(CONCAT('%', :q, '%'))
           OR LOWER(p.apellido) LIKE LOWER(CONCAT('%', :q, '%'))
           OR LOWER(p.dni) LIKE LOWER(CONCAT('%', :q, '%'))
          )
        ORDER BY u.email
    """)
    List<UsuarioBusquedaProjection> buscarUsuariosConTipo(@Param("q") String q,
                                                          @Param("currentId") Long currentId);

    @Query("""
SELECT DISTINCT
    u.id AS id,
    u.email AS email,
    u.roles AS roles,
    p.id AS personaId,
    CONCAT(p.nombre, ' ', p.apellido) AS nombreCompleto,
    p.dni AS dni,
    TYPE(p).name AS tipoPersona
FROM Usuario u
LEFT JOIN u.persona p
WHERE u.email = :email
""")
    List<UsuarioBusquedaProjection> buscarUsuarioBusquedaPorEmail(@Param("email") String email);
*/

}

