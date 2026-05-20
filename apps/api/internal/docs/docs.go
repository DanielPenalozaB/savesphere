package docs

import (
	_ "embed"
	"encoding/json"
	"net/http"

	"github.com/labstack/echo/v4"
	"gopkg.in/yaml.v3"
)

//go:embed openapi.yaml
var openAPISpecYAML []byte

// openAPISpecJSON is the spec converted to JSON for browsers/tools
var openAPISpecJSON []byte

func init() {
	var spec map[string]interface{}
	if err := yaml.Unmarshal(openAPISpecYAML, &spec); err == nil {
		openAPISpecJSON, _ = json.Marshal(spec)
	}
}

// ScalarHTML renders the Scalar API reference UI
const scalarHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>SaveSphere API Reference</title>
  <style>
    body { margin: 0; padding: 0; }
  </style>
</head>
<body>
  <script
    id="api-reference"
    data-url="/openapi.json"
    data-theme="default"
  ></script>
  <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference@latest/dist/browser/standalone.js"></script>
</body>
</html>
`

// RegisterRoutes adds the documentation endpoints to Echo
func RegisterRoutes(e *echo.Echo) {
	// OpenAPI spec as JSON (Scalar loads this)
	e.GET("/openapi.json", func(c echo.Context) error {
		c.Response().Header().Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		return c.Blob(http.StatusOK, echo.MIMEApplicationJSON, openAPISpecJSON)
	})

	// OpenAPI spec as YAML (for direct download)
	e.GET("/openapi.yaml", func(c echo.Context) error {
		c.Response().Header().Set(echo.HeaderContentType, "application/yaml")
		return c.Blob(http.StatusOK, "application/yaml", openAPISpecYAML)
	})

	// Scalar API Reference UI
	e.GET("/docs", func(c echo.Context) error {
		c.Response().Header().Set(echo.HeaderContentType, "text/html; charset=utf-8")
		return c.HTML(http.StatusOK, scalarHTML)
	})
}
