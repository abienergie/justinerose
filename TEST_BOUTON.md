# Test du Bouton "Acheter un forfait"

## Étape par Étape

### 1. Ouvrir la Console du Navigateur

**TRÈS IMPORTANT**: Avant de cliquer sur quoi que ce soit:

1. Ouvrez votre navigateur (Chrome, Firefox, Edge, Safari)
2. Appuyez sur **F12** (ou clic droit > Inspecter)
3. Cliquez sur l'onglet **"Console"**
4. Gardez cette console ouverte pendant les tests

### 2. Aller sur la Page Élève

1. Connectez-vous avec un compte **élève** (pas manager)
2. Vous devriez voir le dashboard élève

### 3. Vérifier que le Bouton Existe

**Question**: Est-ce que vous voyez le bouton "Acheter un forfait" en haut du dashboard?

- ✅ **OUI** → Passez à l'étape 4
- ❌ **NON** → Le bouton n'est pas visible → Voir "Solution A" ci-dessous

### 4. Cliquer sur le Bouton

Cliquez sur "Acheter un forfait" et **regardez la console**

**Qu'est-ce qui se passe?**

#### Cas A: Un modal (popup) s'ouvre
✅ **Bon signe!** Le bouton fonctionne.
- Vous voyez 3 forfaits?
- Vous pouvez en sélectionner un?
- → Passez à l'étape 5

#### Cas B: Rien ne se passe, mais des erreurs rouges dans la console
❌ **Problème côté code**
- Copiez-collez les erreurs et donnez-les moi
- → Voir "Solution B" ci-dessous

#### Cas C: Absolument rien (pas d'erreur, pas de modal)
❌ **Le bouton ne déclenche rien**
- → Voir "Solution C" ci-dessous

### 5. Si le Modal s'Ouvre: Tester le Paiement

1. Sélectionnez un forfait (par exemple "Carte 5 heures")
2. Cliquez sur "Procéder au paiement"
3. **Regardez la console pour les erreurs**

**Qu'est-ce qui se passe?**

#### Cas A: Vous êtes redirigé vers Stripe
✅ **PARFAIT!** Tout fonctionne
- Entrez les infos de carte
- Validez le paiement
- Vous devriez revenir avec le forfait activé

#### Cas B: Message d'erreur dans le modal
❌ **Problème avec l'API**
- Notez le message d'erreur exact
- → Voir "Solution D" ci-dessous

#### Cas C: Rien ne se passe, erreur dans la console
❌ **Problème avec les edge functions**
- Copiez l'erreur de la console
- → Voir "Solution E" ci-dessous

---

## Solutions

### Solution A: Le Bouton n'est Pas Visible

Le bouton n'apparaît pas du tout.

**Action**:
1. Vérifiez que vous êtes bien connecté en tant qu'**élève** (pas manager)
2. Rechargez la page (F5)
3. Faites défiler vers le haut de la page
4. Le bouton devrait être dans l'en-tête rose en haut

Si toujours pas visible, le serveur dev n'a peut-être pas rechargé les changements:
```bash
# Arrêtez le serveur (Ctrl+C)
npm run dev
```

---

### Solution B: Erreurs dans la Console au Clic

Des erreurs rouges apparaissent quand vous cliquez.

**Erreurs possibles:**

**"Cannot read property 'setShowPurchaseModal'"**
→ Le state n'est pas initialisé. Rechargez la page.

**"X is not defined"**
→ Un import manque. Donnez-moi l'erreur exacte.

---

### Solution C: Absolument Rien Ne Se Passe

Pas d'erreur, pas de modal, rien.

**Vérifications:**

1. **Le JavaScript est-il bloqué?**
   - Dans la console, tapez: `console.log('test')`
   - Si vous ne voyez pas "test" → Problème navigateur

2. **Le serveur dev tourne-t-il?**
   - Dans le terminal, vous devriez voir "VITE running at http://localhost:5173"
   - Si non → Lancez `npm run dev`

3. **Le cache du navigateur?**
   - Rechargez en vidant le cache: **Ctrl+Shift+R** (Windows/Linux) ou **Cmd+Shift+R** (Mac)

---

### Solution D: Erreur dans le Modal au Paiement

Le modal s'ouvre, mais erreur au clic sur "Procéder au paiement".

**Erreurs possibles:**

**"Failed to fetch"** ou **"Network error"**
→ Les edge functions ne répondent pas

**Vérifications:**
1. Les fonctions sont-elles bien déployées dans Supabase?
2. Les avez-vous **redéployées** après avoir ajouté les secrets?

**Comment vérifier:**
- Allez sur Supabase → Edge Functions
- Cliquez sur `create-checkout`
- Regardez l'onglet "Logs"
- Y a-t-il des erreurs?

---

### Solution E: Erreur dans la Console au Paiement

**"Invalid API key"**
→ Le secret Stripe n'est pas accessible par la fonction

**Action:**
1. Supabase → Edge Functions → Secrets
2. Vérifiez que `STRIPE_SECRET_KEY` existe
3. **CRUCIAL**: Redéployez `create-checkout`:
   - Cliquez sur la fonction
   - 3 points (...)
   - "Redeploy"

**"Function not found"** ou **"404"**
→ L'URL de la fonction est incorrecte

**Vérification:**
L'URL devrait être:
```
https://znoxebmkxzxtbkiikhzd.supabase.co/functions/v1/create-checkout
```

---

## Test Rapide de la Configuration

Dans la console du navigateur, tapez:

```javascript
console.log(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
```

**Si vous voyez la clé** (pk_live_...) → ✅ Configuration OK côté client

**Si vous voyez `undefined`** → ❌ Redémarrez le serveur:
```bash
# Ctrl+C puis
npm run dev
```

---

## Récapitulatif du Test

1. ⬜ F12 pour ouvrir la console
2. ⬜ Connexion en tant qu'élève
3. ⬜ Le bouton "Acheter un forfait" est visible?
4. ⬜ Clic sur le bouton → Modal s'ouvre?
5. ⬜ Sélection d'un forfait
6. ⬜ Clic "Procéder au paiement" → Redirection Stripe?
7. ⬜ Paiement → Retour sur l'app?
8. ⬜ Forfait visible dans le dashboard?

---

## Ce que Je Dois Savoir

Pour vous aider, dites-moi exactement à quelle étape ça bloque:

1. Le bouton est-il visible? (OUI/NON)
2. Quand vous cliquez, un modal (popup blanc) s'ouvre-t-il? (OUI/NON)
3. S'il y a des erreurs dans la console (F12), lesquelles?
4. Capture d'écran si possible

Avec ces infos, je pourrai vous débloquer immédiatement! 🚀
