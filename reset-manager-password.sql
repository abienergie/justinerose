-- Réinitialiser le mot de passe du compte manager
-- Remplacez 'VOTRE_NOUVEAU_MOT_DE_PASSE' par votre nouveau mot de passe

UPDATE auth.users
SET encrypted_password = crypt('VOTRE_NOUVEAU_MOT_DE_PASSE', gen_salt('bf'))
WHERE email = 'contact@justinerose.fr';
