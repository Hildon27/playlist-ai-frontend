import { useState, useEffect } from 'react';
import { FollowItem } from './FollowItem';
import { userService } from '../../services/api';
import type { FollowDto, FollowRequestDto } from '../../types/follow';
import { FollowRequestItem } from './FollowRequestItem';
import "./style.css";

type Tab = 'followers' | 'following' | 'requests';

export function FollowSocialSection() {
  const [activeTab, setActiveTab] = useState<Tab>('followers');
  const [followers, setFollowers] = useState<FollowDto[]>([]);
  const [followings, setFollowings] = useState<FollowDto[]>([]);
  const [received, setReceived] = useState<FollowRequestDto[]>([]);
  const [sent, setSent] = useState<FollowRequestDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [flrs, flws, recv, snt] = await Promise.all([
          userService.getFollowers(),
          userService.getFolloweds(),
          userService.getReceivedFollowRequests(),
          userService.getSentFollowRequests(),
        ]);

        const toArray = (res: unknown): FollowDto[] => {
          if (Array.isArray(res)) return res;
          if (res && typeof res === 'object') {
            const obj = res as Record<string, unknown>;
            const key = ['data', 'items', 'results', 'follows'].find(k => Array.isArray(obj[k]));
            if (key) return obj[key] as FollowDto[];
          }
          return [];
        };

        setFollowers(toArray(flrs));
        setFollowings(toArray(flws));
        setReceived(Array.isArray(recv) ? recv : (recv as { data?: FollowRequestDto[] })?.data ?? []);
        setSent(Array.isArray(snt) ? snt : (snt as { data?: FollowRequestDto[] })?.data ?? []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleUnfollow = async (userId: string) => {
    await userService.unfollow(userId);
    setFollowings(prev => prev.filter(f => f.followed.id !== userId));
  };

  const handleRemoveFollower = async (userId: string) => {
    await userService.removeFollower(userId);
    setFollowers(prev => prev.filter(f => f.follower.id !== userId));
  };

  const handleAccept = async (id: string) => {
    await userService.processFollowRequest(id, 'accept');
    setReceived(prev => prev.filter(r => r.id !== id));
  };

  const handleReject = async (id: string) => {
    await userService.processFollowRequest(id, 'reject');
    setReceived(prev => prev.filter(r => r.id !== id));
  };

  const handleCancel = async (id: string) => {
    await userService.cancelFollowRequest(id);
    setSent(prev => prev.filter(r => r.id !== id));
  };

  const pendingCount = received.length + sent.length;

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'followers', label: 'Seguidores', count: followers.length },
    { key: 'following', label: 'Seguindo', count: followings.length },
    { key: 'requests', label: 'Solicitações', count: pendingCount },
  ];

  if (loading) return null;

  return (
    <div className="follow-requests-card">
      {/* Tab bar */}
      <div className="follow-tabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`follow-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`follow-tab-badge ${tab.key === 'requests' && tab.count > 0 ? 'badge-alert' : ''}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="follow-tab-content">
        {/* Seguidores */}
        {activeTab === 'followers' && (
          followers.length === 0 ? (
            <p className="empty-message">Nenhum seguidor ainda.</p>
          ) : (
            <div className="follow-requests-list">
              {followers.map(f => (
                <FollowItem
                  key={f.id}
                  person={f.follower}
                  type="follower"
                  onRemove={handleRemoveFollower}
                />
              ))}
            </div>
          )
        )}

        {/* Seguindo */}
        {activeTab === 'following' && (
          followings.length === 0 ? (
            <p className="empty-message">Você não segue ninguém ainda.</p>
          ) : (
            <div className="follow-requests-list">
              {followings.map(f => (
                <FollowItem
                  key={f.id}
                  person={f.followed}
                  type="following"
                  onUnfollow={handleUnfollow}
                />
              ))}
            </div>
          )
        )}

        {/* Solicitações */}
        {activeTab === 'requests' && (
          received.length === 0 && sent.length === 0 ? (
            <p className="empty-message">Nenhuma solicitação pendente.</p>
          ) : (
            <>
              {received.length > 0 && (
                <div className="follow-requests-section">
                  <h3>Recebidas</h3>
                  <div className="follow-requests-list">
                    {received.map(r => (
                      <FollowRequestItem
                        key={r.id}
                        request={r}
                        type="received"
                        onAccept={handleAccept}
                        onReject={handleReject}
                      />
                    ))}
                  </div>
                </div>
              )}
              {received.length > 0 && sent.length > 0 && (
                <div className="follow-requests-divider" />
              )}
              {sent.length > 0 && (
                <div className="follow-requests-section">
                  <h3>Enviadas</h3>
                  <div className="follow-requests-list">
                    {sent.map(r => (
                      <FollowRequestItem
                        key={r.id}
                        request={r}
                        type="sent"
                        onCancel={handleCancel}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )
        )}
      </div>
    </div>
  );
}