import unittest
from PIL import Image, ImageDraw
from measure_pixels import profile, line_envelope


class PixelMeasurementTests(unittest.TestCase):
    def test_known_rectangle_area_and_grid(self):
        im=Image.new('RGB',(160,240),'black')
        ImageDraw.Draw(im).rectangle((40,60,119,179),fill='white')
        for threshold in (100,140,180):
            p=profile(im,(0,0,160,240),threshold)
            self.assertEqual(p['bright_pixel_fraction'],.25)
            self.assertEqual(p['occupancy_grid_24x16'][10][7],1)
            self.assertEqual(p['occupancy_grid_24x16'][0][0],0)

    def test_envelope_against_known_band(self):
        im=Image.new('RGB',(160,240),'black')
        ImageDraw.Draw(im).rectangle((0,80,159,119),fill='white')
        e=line_envelope(im,{'id':'synthetic','crop_xyxy':[0,0,160,240],'base_band_y':[90,110]})
        self.assertEqual(e['upper_extent_in_base_band_heights_32_bins'],[.5]*32)
        self.assertEqual(e['lower_extent_in_base_band_heights_32_bins'],[.5]*32)


if __name__=='__main__':
    unittest.main()
