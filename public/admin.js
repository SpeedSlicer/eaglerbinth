document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const uploadButton = document.getElementById('uploadButton');
    const uploadStatus = document.getElementById('uploadStatus');
    const modsTable = document.getElementById('modsTable');

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
                uploadStatus.textContent = text;
                setTimeout(() => location.reload(), 1000);
            })
            .catch(error => {
                console.error('Error:', error);
                uploadStatus.textContent = 'Error uploading file.';
            })
            .finally(() => {
                uploadButton.disabled = false;
                uploadButton.textContent = 'Upload File';
            });
        });
    }

    if (modsTable) {
        fetch('/list-files')
            .then(response => response.json())
            .then(mods => {
                const tableHTML = `
                    <table>
                        <thead>
                            <tr>
                                <th>Display Name</th>
                                <th>Mod Name</th>
                                <th>Description</th>
                                <th>Author</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${mods.map(mod => `
                                <tr>
                                    <td>${mod['display-name']}</td>
                                    <td>${mod['mod-name']}</td>
                                    <td>${mod.description}</td>
                                    <td>${mod.author}</td>
                                    <td>
                                        <button onclick="deleteMod('${mod['mod-name']}')">Delete</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
                modsTable.innerHTML = tableHTML;
            })
            .catch(error => {
                console.error('Error:', error);
                modsTable.innerHTML = 'Error loading mods.';
            });
    }
});

function deleteMod(modName) {
    fetch(`/admin/delete-mod/${modName}`, {
        method: 'DELETE',
    })
    .then(response => response.text())
    .then(text => {
        alert(text);
        location.reload();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error deleting mod.');
    });
}
