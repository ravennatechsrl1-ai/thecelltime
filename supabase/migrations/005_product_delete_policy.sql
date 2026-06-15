-- Allow admin product deletion from dashboard
CREATE POLICY "Prodotti eliminabili"
  ON products FOR DELETE
  USING (true);
