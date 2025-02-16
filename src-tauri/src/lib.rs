use reqwest;
use std::io::Cursor;

#[tauri::command]
async fn download_file(url: String, extract_path: String) -> Result<(), String> {
    let response = reqwest::get(&url).await.map_err(|e| e.to_string())?;

    if !response.status().is_success() {
        return Err(format!("Failed to download file: {}", response.status()));
    }

    let content = response.bytes().await.map_err(|e| e.to_string())?;
    let reader = Cursor::new(content);
    zip_extract::extract(reader, extract_path.as_ref(), false);

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![download_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
