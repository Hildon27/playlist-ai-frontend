import { useEffect, useRef, useState } from "react";
import type { UserResponseWithFollowInfoDTO } from "../../types/user";
import "./style.css";
import { userService } from "../../services/api";

interface Props {
  title: string;
  users: UserResponseWithFollowInfoDTO[];
  loading?: boolean;
}

export function UsersCarousel({ title, users: initialUsers, loading }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  function scrollCarousel(direction: "left" | "right") {
    if (!carouselRef.current) return;

    carouselRef.current.scrollBy({
      left: direction === "left" ? -300 : 300,
      behavior: "smooth",
    });
  }

  function getInitials(user: UserResponseWithFollowInfoDTO) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }

  function handleFollowClick(
    user: UserResponseWithFollowInfoDTO,
    e: React.MouseEvent,
  ) {
    e.stopPropagation();
    if (!user.followedByLoggedUser && !user.followRequestPending) {
      userService
        .requestFollow(user.email)
        .then((res) => {
          setUsers((prev) =>
            prev.map((u) =>
              u.id === user.id
                ? { ...u, followRequestPending: true, followRequestId: res.id }
                : u,
            ),
          );
        })
        .catch((err) => console.error("Erro ao enviar solicitação", err));
    }
  }

  function handleCancelFollowRequest(
    user: UserResponseWithFollowInfoDTO,
    e: React.MouseEvent,
  ) {
    e.stopPropagation();
    if (user.followRequestPending && user.followRequestId) {
      userService
        .cancelFollowRequest(user.followRequestId)
        .then(() => {
          setUsers((prev) =>
            prev.map((u) =>
              u.id === user.id
                ? {
                    ...u,
                    followRequestPending: false,
                    followRequestId: undefined,
                  }
                : u,
            ),
          );
        })
        .catch((err) => console.error("Erro ao cancelar solicitação", err));
    }
  }

  async function handleUnfollow(e: React.MouseEvent, userId: string) {
    e.stopPropagation();
    try {
      await userService.unfollow(userId);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, followedByLoggedUser: false } : u,
        ),
      );
    } catch (err) {
      console.error("Erro ao deixar de seguir usuário", err);
    }
  }

  return (
    <>
      <div className="section-header">
        <h2 className="section-title">{title}</h2>

        <div className="carousel-controls">
          <button
            className="carousel-btn"
            onClick={() => scrollCarousel("left")}
          >
            ‹
          </button>

          <button
            className="carousel-btn"
            onClick={() => scrollCarousel("right")}
          >
            ›
          </button>
        </div>
      </div>

      <div className="carousel-container">
        <div className="playlists-carousel" ref={carouselRef}>
          {loading ? (
            <>
              <div className="playlist-card skeleton-card">
                <div className="skeleton-cover" />
                <div className="skeleton-line wide" />
              </div>
              <div className="playlist-card skeleton-card">
                <div className="skeleton-cover" />
                <div className="skeleton-line wide" />
              </div>
            </>
          ) : (
            users.map((user) => (
              <div key={user.id} className="playlist-card card-relative">
                {/* Avatar */}
                <div className="cover-wrapper">
                  <div
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "2rem",
                      color: "#fff",
                      fontWeight: "600",
                    }}
                  >
                    {getInitials(user)}
                  </div>
                </div>

                <div className="card-header">
                  <h3>
                    {user.firstName} {user.lastName}
                  </h3>
                </div>

                <p className="card-description">{user.email}</p>

                <span className="card-date">Perfil público</span>

                {/* Botões de Ação Embaixo */}
                <div className="card-actions">
                  {user.followedByLoggedUser ? (
                    <button
                      className="btn-action btn-unfollow"
                      onClick={(e) => handleUnfollow(e, user.id)}
                    >
                      Deixar de seguir
                    </button>
                  ) : user.followRequestPending ? (
                    <button
                      className="btn-action btn-pending"
                      onClick={(e) => handleCancelFollowRequest(user, e)}
                    >
                      Cancelar Solicitação
                    </button>
                  ) : (
                    <button
                      className="btn-action btn-follow"
                      onClick={(e) => handleFollowClick(user, e)}
                    >
                      Seguir
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
