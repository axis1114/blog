package utils

import (
	"fmt"
	"math/rand"
	"time"
)

func GenCode() string {
	rand.NewSource(time.Now().UnixNano())
	return fmt.Sprintf("%04d", rand.Intn(10000))
}
