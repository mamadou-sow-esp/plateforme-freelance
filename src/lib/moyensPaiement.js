import waveLogo from '../assets/wave-logo.jpg'
import orangeMoneyLogo from '../assets/orange-money-logo.png'

// Moyens de paiement que les prestataires peuvent indiquer accepter
// en dehors de l'application (aucun paiement n'est traité dans l'app).
export const MOYENS_PAIEMENT = [
  { id: 'wave', label: 'Wave', logo: waveLogo },
  { id: 'orange_money', label: 'Orange Money', logo: orangeMoneyLogo },
  { id: 'especes', label: 'Espèces', logo: null },
]
