import { useState } from 'react';
import axios from 'axios';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default function LoginPage(props) {
    const { onSuccess } = props;

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    async function onLogin() {
        try {
            const res = await axios.post('/login', { username: username, password: password });
            console.log(res)
            onSuccess();
        }
        catch (e) {
            console.log('Bad credentials, login failed');
            // Do nothing, meh
        }
    }
    
    return (
        <section>
            <input value={username} onChange={e => setUsername(e.target.value)} />
            <input value={password} onChange={e => setPassword(e.target.value)} />
            <button type='button' onClick={onLogin}>Login</button>
        </section>
    );
}