package services

import (
	"context"
	"net"

	"savesphere-api/internal/repository"

	"github.com/google/uuid"
)

type AuditService interface {
	LogLogin(ctx context.Context, userID *uuid.UUID, ipAddress net.IP, userAgent string, authProvider string, success bool, reason string)
}

type auditService struct {
	repo repository.LoginAuditRepository
}

func NewAuditService(repo repository.LoginAuditRepository) AuditService {
	return &auditService{repo: repo}
}

func (s *auditService) LogLogin(ctx context.Context, userID *uuid.UUID, ipAddress net.IP, userAgent string, authProvider string, success bool, reason string) {
	_ = s.repo.Create(ctx, userID, ipAddress, userAgent, authProvider, success, reason)
}
