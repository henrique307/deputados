import { initializeApp, deleteApp } from 'firebase/app';
import { getDatabase, ref, get, child } from 'firebase/database'; // Importe 'get' e 'child'
import { firebaseConfig } from '../config/firebase.config';

export async function readDataFromDatabase(path: string) {
  try {
    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);
    // A função 'ref(database)' cria uma referência à raiz do seu banco de dados.
    // 'child(ref(database), path)' cria uma referência ao caminho específico que você quer ler.
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, path));

    if (snapshot.exists()) {
      const data = snapshot.val();
      await deleteApp(app);
      return data;
    }

    return [];
  } catch (error) {
    console.error('Erro ao ler dados do Firebase:', error);
    throw error; // Propagar o erro para que o finally ainda seja executado
  }
}
