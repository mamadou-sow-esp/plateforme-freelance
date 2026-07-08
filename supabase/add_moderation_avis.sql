-- À exécuter une seule fois dans Supabase (SQL Editor du dashboard).
-- Ajoute la possibilité pour l'administrateur de masquer un avis sans le supprimer.

alter table avis
  add column if not exists masque boolean not null default false,
  add column if not exists masque_le timestamptz,
  add column if not exists masque_par uuid references profiles(id);
