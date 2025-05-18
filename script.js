document.addEventListener('DOMContentLoaded', () => {
  const userList = document.getElementById('userList');
  const addUserBtn = document.getElementById('addUserBtn');
  const userFormModal = document.getElementById('userFormModal');
  const closeModal = document.getElementById('closeModal');
  const userForm = document.getElementById('userForm');
  const formTitle = document.getElementById('formTitle');
  const submitBtn = document.getElementById('submitBtn');

  let users = [];

  function loadUsers() {
    const storedUsers = localStorage.getItem('users');
  
    if (storedUsers) {
      users = JSON.parse(storedUsers);
      renderUsers();
    } else {
      fetch('users.xml')
        .then(response => response.text())
        .then(data => {
          const parser = new DOMParser();
          const xml = parser.parseFromString(data, 'application/xml');
          const userElements = xml.getElementsByTagName('user');
          const xmlUsers = Array.from(userElements).map(user => ({
          id: user.getElementsByTagName('id')[0].textContent,
          name: user.getElementsByTagName('name')[0].textContent,
          age: user.getElementsByTagName('age')[0].textContent,
          address: user.getElementsByTagName('address')[0].textContent,
          profession: user.getElementsByTagName('profession')[0].textContent,
          hobbies: user.getElementsByTagName('hobbies')[0].textContent,
          image: user.getElementsByTagName('image')[0]?.textContent.trim() || ''
         }));

  
          // Set only if nothing is stored
          users = xmlUsers;
          localStorage.setItem('users', JSON.stringify(users));
          renderUsers();
        })
        .catch(error => console.error('Error loading XML:', error));
    }
  }
  

  function renderUsers() {
    userList.innerHTML = '';
    users.forEach(user => {
      const card = document.createElement('div');
      card.className = 'user-card';
      card.innerHTML = `
        <img src="${user.image || 'https://via.placeholder.com/100'}" class="card-img" alt="Profile">
        <h3>${user.name}</h3>
        <p><strong>Age:</strong> ${user.age}</p>
        <p><strong>Address:</strong> ${user.address}</p>
        <p><strong>Profession:</strong> ${user.profession}</p>
        <p><strong>Hobbies:</strong> ${user.hobbies}</p>
        <div class="actions">
          <button class="edit-btn" data-id="${user.id}">Edit</button>
          <button class="delete-btn" data-id="${user.id}">Delete</button>
        </div>
      `;
      userList.appendChild(card);
    });
  }

  function showModal(edit = false, userData = {}) {
    userForm.reset();
    document.getElementById('preview').src = '';
    document.getElementById('image').value = '';

    if (edit) {
      formTitle.textContent = 'Edit User';
      submitBtn.textContent = 'Update';
      document.getElementById('userId').value = userData.id;
      document.getElementById('name').value = userData.name;
      document.getElementById('age').value = userData.age;
      document.getElementById('address').value = userData.address;
      document.getElementById('profession').value = userData.profession;
      document.getElementById('hobbies').value = userData.hobbies;
      document.getElementById('preview').src = userData.image || '';
    } else {
      formTitle.textContent = 'Add User';
      submitBtn.textContent = 'Save';
    }

const imageInput = document.getElementById('image');

imageInput.addEventListener('change', function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      document.getElementById('preview').src = reader.result;
    };
    reader.readAsDataURL(file);
  } else {
    // If no file selected, fall back to image in preview (from XML)
    document.getElementById('preview').src = userData.image || '';
  }
});


    userFormModal.classList.remove('hidden');
  }

  function hideModal() {
    userFormModal.classList.add('hidden');
  }

  userForm.addEventListener('submit', e => {
    e.preventDefault();

    const id = document.getElementById('userId').value;
    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;
    const address = document.getElementById('address').value;
    const profession = document.getElementById('profession').value;
    const hobbies = document.getElementById('hobbies').value;
    const imageInput = document.getElementById('image');
    const imageFile = imageInput.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const newImage = reader.result || '';

      if (id) {
        users = users.map(user =>
          user.id === id
            ? { ...user, name, age, address, profession, hobbies, image: newImage || user.image }
            : user
        );
      } else {
        const newId = Date.now().toString();
        users.push({ id: newId, name, age, address, profession, hobbies, image: newImage });
      }

      localStorage.setItem('users', JSON.stringify(users));
      renderUsers();
      hideModal();
    };

    if (imageFile) {
      reader.readAsDataURL(imageFile);
    } else {
      reader.onload();
    }
  });

  userList.addEventListener('click', e => {
    const id = e.target.dataset.id;
    if (e.target.classList.contains('edit-btn')) {
      const user = users.find(user => user.id === id);
      showModal(true, user);
    }

    if (e.target.classList.contains('delete-btn')) {
      if (confirm('Are you sure you want to delete this user?')) {
        users = users.filter(user => user.id !== id);
        localStorage.setItem('users', JSON.stringify(users));
        renderUsers();
      }
    }
  });

  addUserBtn.addEventListener('click', () => showModal());
  closeModal.addEventListener('click', hideModal);
  window.addEventListener('click', e => {
    if (e.target === userFormModal) hideModal();
  });

  loadUsers();
});
