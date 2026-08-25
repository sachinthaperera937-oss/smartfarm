const form=document.querySelector('#loginForm');
const demo={name:'Alex Morgan',email:'alex@smartfarm.demo',password:'demo1234'};
const accounts=()=>JSON.parse(localStorage.getItem('smartfarm-accounts')||'[]');
form.addEventListener('submit',event=>{event.preventDefault();const email=document.querySelector('#email').value.trim().toLowerCase();const password=document.querySelector('#password').value;const account=[demo,...accounts()].find(item=>item.email===email&&item.password===password);if(!account){document.querySelector('#loginError').textContent='We could not find that account. Create an account to get started.';return}localStorage.setItem('smartfarm-user',JSON.stringify({name:account.name,email:account.email}));window.location.replace('index.html')});
