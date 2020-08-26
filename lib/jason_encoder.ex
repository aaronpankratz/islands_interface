require Protocol

Protocol.derive(Jason.Encoder, IslandsEngine.Island)
Protocol.derive(Jason.Encoder, IslandsEngine.Coordinate)

defimpl Jason.Encoder, for: [MapSet, Range, Stream] do
  def encode(struct, opts) do
    Jason.Encode.list(Enum.to_list(struct), opts)
  end
end
