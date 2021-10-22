import { useState } from 'react';
import axios from 'axios';
import './Login.scss';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default function LoginPage(props) {
    const { onSuccess } = props;

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    async function onLogin(e) {
        e.preventDefault();
        try {
            const res = await axios.post('/login', { username: username, password: password });
            onSuccess();
        }
        catch (e) {
            console.log('Bad credentials, login failed');
            // Do nothing, meh
        }
    }
    
    return (
        <form className='login' onSubmit={onLogin}>
            <input 
                autoFocus 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
            />

            <input 
                type='password'
                value={password} 
                onChange={e => setPassword(e.target.value)} 
            />
            
            <button type='submit'>Login</button>
        </form>
    );
}