export interface Friend {
  id: number;
  senderId: number;
  recipientId: number;
  status: string; // Vous pouvez définir le statut de la demande ici, par exemple : 'pending', 'accepted', etc.
}
