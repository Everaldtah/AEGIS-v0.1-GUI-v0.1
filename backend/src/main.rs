mod api;
mod models;
mod services;

use axum::{
    http::Method,
    Router,
};
use services::AppState;
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};
use tracing_subscriber;

#[tokio::main]
async fn main() {
    // Initialize tracing
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .init();

    // Create app state
    let state = Arc::new(AppState::new());

    // Build our application with routes
    let app = api::create_router(state)
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
                .allow_headers(Any)
        );

    // Create a TCP listener
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();

    tracing::info!("AEGIS Studio Backend listening on {}", listener.local_addr().unwrap());

    // Serve the application
    axum::serve(listener, app).await.unwrap();
}
