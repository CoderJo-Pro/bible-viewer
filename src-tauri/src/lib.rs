use reqwest;
use std::io::Write;

#[tauri::command]
async fn download_file(url: String, save_path: String, extract_path: String) -> Result<(), String> {
    let response = reqwest::get(&url).await.map_err(|e| e.to_string())?;

    if !response.status().is_success() {
        return Err(format!("Failed to download file: {}", response.status()));
    }

    let mut file = std::fs::File::create(&save_path).map_err(|e| e.to_string())?;
    let content = response.bytes().await.map_err(|e| e.to_string())?;
    file.write_all(&content).map_err(|e| e.to_string())?;
    drop(file);

    let file = std::fs::File::open(&save_path).map_err(|e| e.to_string())?;
    let reader = std::io::BufReader::new(file);
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
