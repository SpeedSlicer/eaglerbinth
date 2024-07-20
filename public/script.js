document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const uploadButton = document.getElementById('uploadButton');

    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            uploadButton.disabled = true;
            uploadButton.textContent = 'Uploading...';

            fetch('/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => response.text())
            .then(text => {
                document.getElementById('fileContent').textContent = text;
                setTimeout(() => window.location.href = 'directory.html', 1000);
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('fileContent').textContent = 'Error uploading file.';
            })
            .finally(() => {
                uploadButton.disabled = false;
                uploadButton.textContent = 'Upload File';
            });
        });
    }

    if (document.getElementById('directoryExplorer')) {
        fetch('/list-files')
            .then(response => response.json())
            .then(files => {
                console.log('Fetched files:', files); 
                const fileList = files.map(file => 
                    `<li>
                        <img src="${file.icon || '/images/default.png'}" alt="${file['display-name']} icon" class="mod-icon">
                        <div class="mod-info">
                            <h2>${file['display-name'] || 'Unnamed Mod'}</h2>
                            <p>${file.description || 'No description provided.'}</p>
                            <p>Author: <a href="${file['author-link'] || '#'}" target="_blank">${file.author || 'Unknown'}</a></p>
                            <p><a href="${file['repo-link'] || '#'}" target="_blank">Repository</a></p>
                            <a href="${file['download-link'] || '#'}" download>
                                <button>Download</button>
                            </a>
                        </div>
                    </li>`
                ).join('');
                document.getElementById('directoryExplorer').innerHTML = `<ul>${fileList}</ul>`;
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('directoryExplorer').textContent = 'Error loading file list.';
            });
    }
});
