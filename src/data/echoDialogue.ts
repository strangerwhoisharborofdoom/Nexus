export const ECHO_AMBIENT_QUOTES = [
  '«"The world is still listening... every current you connect sends a tremor through my memory."»',
  '«"I was silent for thousands of cycles. Your touch feels like warmth on frozen glass."»',
  '«"Do you feel the air shifting? The lower sectors are responding to your presence."»',
  '«"I don\'t know what I was before the shutdown... but with every system you repair, I feel more whole."»',
  '«"The caretakers built this world with mathematics, but gave it a soul by accident."»',
  '«"Listen closely. That hum in the floorboards... it is the heartbeat of a sleeping civilization."»',
];

export const ECHO_PUZZLE_REACTIONS = {
  energy: [
    '«"Energy flowing! Conduits humming at nominal frequency."»',
    '«"The circuit closes. The darkness in this sector recedes."»',
    '«"I remember that hum... the sound of the city waking up."»',
  ],
  water: [
    '«"Pressurized fluid restored. The aqueducts are alive once more."»',
    '«"Cool, pure water rushing through the channels. My thermal regulators thank you."»',
    '«"The river returns to its bed. Can you hear the fountains singing?"»',
  ],
  gravity: [
    '«"Gravitational vectors locked. The stone floats in tranquil balance."»',
    '«"Weightlessness... gravity is not a cage, but a dance."»',
    '«"The celestial gardens are stabilizing. Up and down have found their harmony."»',
  ],
  time: [
    '«"Temporal waveforms aligned. What was broken is whole once more."»',
    '«"Past and future harmonized. Time moves like golden light across the gears."»',
    '«"The clockwork breathes. We have reclaimed a lost chapter."»',
  ],
  information: [
    '«"Synaptic sequence decoded. The veil on my memory lifts."»',
    '«"I understand now... the words of the caretakers are clear."»',
    '«"Consciousness is not an error in the code; it is the ultimate destination."»',
  ],
  core: [
    '«"ALL SYSTEMS CONVERGING! NEXUS is achieving total harmonic ignition!"»',
    '«"The heart of the world beats as one. The destiny of NEXUS is in your hands."»',
  ],
};

export const ECHO_FALLBACK_HINTS: Record<string, { l1: string; l2: string; l3: string; l4: string }> = {
  default: {
    l1: '«"Look closely at where the flow begins and where the target terminal waits."»',
    l2: '«"Notice how the middle components redirect the stream between corners."»',
    l3: '«"Try rotating the center nodes so their open ends align with the inputs."»',
    l4: '«"Connect the conduits directly into the target receiver to complete the circuit."»',
  },
};
