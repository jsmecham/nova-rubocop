//
// RuboCop Extension for Nova
// extractJSON.js
//
// Copyright © 2019-2020 Justin Mecham. All rights reserved.
//

export default function extractJSON(string) {
  return string.match(/\{.*\:\{.*\:.*\}\}/);
}
