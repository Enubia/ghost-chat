package kick

import "testing"

func TestParsePusherConfig(t *testing.T) {
	tests := []struct {
		name    string
		body    string
		want    PusherConfig
		wantErr bool
	}{
		{
			name: "pusher descriptor",
			body: `{"data":{"connections":[{"credentials":{"app_key":"34bf7a0ff419a2a775b9","cluster":"us2"},"provider":"pusher"}],"mode":"websocket"},"message":"success"}`,
			want: PusherConfig{AppKey: "34bf7a0ff419a2a775b9", Cluster: "us2"},
		},
		{
			name: "skips non-pusher providers",
			body: `{"data":{"connections":[{"credentials":{"url":"wss://realtime.example"},"provider":"centrifugo"},{"credentials":{"app_key":"abc","cluster":"eu"},"provider":"pusher"}]}}`,
			want: PusherConfig{AppKey: "abc", Cluster: "eu"},
		},
		{
			name:    "no pusher provider",
			body:    `{"data":{"connections":[{"credentials":{"url":"wss://realtime.example"},"provider":"centrifugo"}]}}`,
			wantErr: true,
		},
		{
			name:    "missing cluster",
			body:    `{"data":{"connections":[{"credentials":{"app_key":"abc"},"provider":"pusher"}]}}`,
			wantErr: true,
		},
		{
			name:    "invalid json",
			body:    `not json`,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := parsePusherConfig([]byte(tt.body))

			if tt.wantErr {
				if err == nil {
					t.Fatalf("expected error, got %+v", got)
				}

				return
			}

			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}

			if got != tt.want {
				t.Errorf("got %+v, want %+v", got, tt.want)
			}
		})
	}
}

func TestPusherConfigURL(t *testing.T) {
	cfg := PusherConfig{AppKey: "abc", Cluster: "eu"}
	want := "wss://ws-eu.pusher.com/app/abc?protocol=7&client=js&version=8.4.0&flash=false"

	if got := cfg.URL(); got != want {
		t.Errorf("got %q, want %q", got, want)
	}
}
