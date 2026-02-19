use crate::models::{CompileRequest, CompileResponse, PolicyValidationResult};
use crate::services::get_aegis_binary_path;
use std::process::Command;

pub async fn compile_code(req: CompileRequest) -> CompileResponse {
    let aegiscc_path = get_aegis_binary_path("aegiscc");

    // Run aegiscc with --eval flag
    let output = Command::new(&aegiscc_path)
        .arg("--eval")
        .arg(&req.code)
        .arg("--emit-bytecode")
        .output();

    match output {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout).to_string();
            let stderr = String::from_utf8_lossy(&output.stderr).to_string();

            if output.status.success() {
                CompileResponse {
                    success: true,
                    ast: parse_ast_from_output(&stdout),
                    bytecode: Some(stdout.clone()),
                    policy_validation: PolicyValidationResult {
                        passed: true,
                        violations: vec![],
                        warnings: vec![],
                    },
                    error: None,
                    output: Some(stdout),
                }
            } else {
                CompileResponse {
                    success: false,
                    ast: None,
                    bytecode: None,
                    policy_validation: PolicyValidationResult {
                        passed: false,
                        violations: vec![stderr.clone()],
                        warnings: vec![],
                    },
                    error: Some(stderr),
                    output: None,
                }
            }
        }
        Err(e) => {
            CompileResponse {
                success: false,
                ast: None,
                bytecode: None,
                policy_validation: PolicyValidationResult {
                    passed: false,
                    violations: vec![format!("Failed to run compiler: {}", e)],
                    warnings: vec![],
                },
                error: Some(format!("Compiler error: {}", e)),
                output: None,
            }
        }
    }
}

fn parse_ast_from_output(output: &str) -> Option<serde_json::Value> {
    // For now, return a placeholder AST structure
    // In a real implementation, we'd parse the actual AST from the compiler output
    Some(serde_json::json!({
        "type": "Program",
        "functions": [
            {
                "name": "main",
                "statements": []
            }
        ]
    }))
}
