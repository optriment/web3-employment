import { fromTokens, toTokens } from '@/lib/blockchain'

describe('toTokens', () => {
  describe('with 0.000001', () => {
    it('returns converted value', () => {
      const result = toTokens(0.000001)

      expect(result).toEqual(1)
    })
  })

  describe('with 0.000099', () => {
    it('returns converted value', () => {
      const result = toTokens(0.000099)

      expect(result).toEqual(99)
    })
  })

  describe('with 0.009900', () => {
    it('returns converted value', () => {
      const result = toTokens(0.0099)

      expect(result).toEqual(9900)
    })
  })

  describe('with 2.31', () => {
    it('returns converted value', () => {
      const result = toTokens(2.31)

      expect(result).toEqual(2310000)
    })
  })

  describe('with 530.31', () => {
    it('returns converted value', () => {
      const result = toTokens(530.31)

      expect(result).toEqual(530310000)
    })
  })

  describe('with 99999.999999', () => {
    it('returns converted value', () => {
      const result = toTokens(99999.999999)

      expect(result).toEqual(99999999999)
    })
  })
})

describe('fromTokens', () => {
  describe('with 1000000', () => {
    it('returns converted value', () => {
      const result = fromTokens(1000000)

      expect(result).toEqual(1)
    })
  })

  describe('with 2310000', () => {
    it('returns converted value', () => {
      const result = fromTokens(2310000)

      expect(result).toEqual(2.31)
    })
  })

  describe('with 530310000', () => {
    it('returns converted value', () => {
      const result = fromTokens(530310000)

      expect(result).toEqual(530.31)
    })
  })

  describe('with 99999999999', () => {
    it('returns converted value', () => {
      const result = fromTokens(99999999999)

      expect(result).toEqual(99999.999999)
    })
  })
})
